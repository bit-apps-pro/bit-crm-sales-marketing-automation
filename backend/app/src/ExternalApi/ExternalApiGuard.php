<?php

namespace BitApps\Crm\src\ExternalApi;

use BitApps\Crm\Config;
use BitApps\Crm\Constants\HookKeys;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Services\ExternalApiKeyService;
use WP_Error;
use WP_REST_Request;
use WP_REST_Server;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Polices requests that reach the CRM REST API from outside WordPress.
 *
 * The router registers every route with permission_callback '__return_true' and
 * defers authentication to LoggedInMiddleware, which only asks
 * is_user_logged_in(). That check is identity based rather than nonce based, so
 * core's Application Passwords satisfy it as-is and every endpoint becomes
 * callable over HTTP Basic auth without any change to the router.
 *
 * This guard narrows that down. It runs on rest_pre_dispatch and only acts when
 * the current request authenticated with an Application Password, which core
 * reports through rest_get_authenticated_app_password(). Admin UI traffic
 * (cookie + nonce) and client portal traffic return null there and pass through
 * untouched, so nothing about the existing setup changes.
 *
 * External callers are then subject to:
 *   1. a master on/off option,
 *   2. the AllowedRoutes deny-by-default allowlist,
 *   3. a per-key rate limit.
 */
final class ExternalApiGuard
{
    private const WINDOW_SECONDS = 60;

    private const MAX_PER_WINDOW = 120;

    private const RATE_LIMIT_PREFIX = 'bit_crm_ext_rl_';

    /**
     * Short-circuits external requests that are disabled, unpublished or over
     * their rate limit.
     *
     * Hooked to rest_pre_dispatch, which runs before the route is matched, so
     * $request->get_route() is the requested path rather than a matched pattern.
     * Returning a non-empty value stops dispatch and becomes the response;
     * returning $result unchanged lets the request continue.
     *
     * @param mixed           $result
     * @param WP_REST_Server  $server
     * @param WP_REST_Request $request
     */
    public static function handle($result, $server, $request)
    {
        // Something earlier already short-circuited the request.
        if (!empty($result)) {
            return $result;
        }

        if (!$request instanceof WP_REST_Request) {
            return $result;
        }

        /*
         * Application Passwords landed in WP 5.6 and the plugin still declares
         * 5.0 as its minimum. On older cores the feature does not exist, so no
         * request can be authenticated this way and there is nothing to police.
         * Passing through is both correct and safe here -- denying would lock
         * the plugin's own admin UI out of its API.
         */
        if (!\function_exists('rest_get_authenticated_app_password')) {
            return $result;
        }

        $appPassword = rest_get_authenticated_app_password();

        // Not an Application Password request: admin UI or client portal.
        if (empty($appPassword)) {
            return $result;
        }

        $path = self::resolvePluginPath($request->get_route());

        // Not one of our namespaces, not our business.
        if ($path === false) {
            return $result;
        }

        if (!self::isEnabled()) {
            return new WP_Error(
                'bit_crm_external_api_disabled',
                __('External API access is disabled.', 'bit-crm-sales-marketing-automation'),
                ['status' => 403]
            );
        }

        if (!AllowedRoutes::isAllowed($request->get_method(), $path)) {
            return new WP_Error(
                'bit_crm_endpoint_not_public',
                __('This endpoint is not available for external API access.', 'bit-crm-sales-marketing-automation'),
                ['status' => 403]
            );
        }

        return self::enforceRateLimit($appPassword, $server, $result);
    }

    /**
     * Defaults to enabled so Application Passwords work without a settings
     * screen. Flip the default to false once the settings UI ships and can write
     * the option.
     *
     * The default is 1 rather than true to match how the setting is stored --
     * see ExternalApiKeyService::updateEnabled().
     */
    private static function isEnabled()
    {
        return (bool) Config::getOption(ExternalApiKeyService::ENABLED_OPTION, 1);
    }

    /**
     * Strips the REST namespace and version from a route, e.g.
     * '/bit-crm-sales-marketing-automation/v1/contacts/123' -> 'contacts/123'.
     * Returns false for another plugin's namespace or core's, letting those
     * requests through untouched.
     *
     * Every namespace this plugin exposes derives from its own slug: the plugin
     * registers Config::SLUG and add-ons register that slug with a suffix, so
     * matching slug + optional suffix covers the whole family without this plugin
     * needing to know which add-ons exist.
     *
     * That generality is deliberate. An unmatched namespace is passed through, so
     * a namespace this method missed would skip the allowlist and rate limit
     * entirely -- fail open. Deriving the match from the slug keeps any add-on
     * policed by default, and the allowlist then decides what is reachable. Any
     * API version matches for the same reason: a future v2 is policed on arrival
     * rather than exposed by omission.
     *
     * @param string $route
     *
     * @return false|string
     */
    private static function resolvePluginPath($route)
    {
        $pattern = '/^\/'
            . preg_quote(Config::SLUG, '/')
            . '(?:-[a-z0-9-]+)?'
            . '\/v\d+\/(.*)$/';

        if (!preg_match($pattern, (string) $route, $matches)) {
            return false;
        }

        return trim($matches[1], '/');
    }

    /**
     * Counts the request against the key's window and rejects it once the cap is
     * reached. Keyed on the Application Password UUID, not the user, so one key
     * cannot exhaust another's budget.
     *
     * Fixed window rather than sliding: a caller can burst up to twice the cap
     * across a window boundary. The get and set are not atomic either, so a few
     * concurrent requests can slip over. Neither matters for stopping runaway
     * clients, which is all this is for.
     *
     * @param string         $appPassword
     * @param WP_REST_Server $server
     * @param mixed          $result
     */
    private static function enforceRateLimit($appPassword, $server, $result)
    {
        $window = (int) floor(time() / self::WINDOW_SECONDS);
        $key = self::RATE_LIMIT_PREFIX . md5((string) $appPassword) . '_' . $window;

        $used = (int) get_transient($key);
        $limit = (int) Hooks::applyFilter(HookKeys::EXTERNAL_API_RATE_LIMIT, self::MAX_PER_WINDOW);

        if ($limit > 0 && $used >= $limit) {
            $retryAfter = (($window + 1) * self::WINDOW_SECONDS) - time();
            $retryAfter = max(1, $retryAfter);

            if ($server instanceof WP_REST_Server) {
                $server->send_header('Retry-After', (string) $retryAfter);
            }

            return new WP_Error(
                'bit_crm_rate_limited',
                __('Rate limit exceeded. Please retry shortly.', 'bit-crm-sales-marketing-automation'),
                ['status' => 429]
            );
        }

        // Twice the window so the counter expires on its own.
        set_transient($key, $used + 1, self::WINDOW_SECONDS * 2);

        return $result;
    }
}
