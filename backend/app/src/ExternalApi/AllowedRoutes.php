<?php

namespace BitApps\Crm\src\ExternalApi;

use BitApps\Crm\Constants\HookKeys;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Allowlist of endpoints reachable with an Application Password.
 *
 * Deny by default: an endpoint is unreachable from outside WordPress unless it
 * is listed here. Endpoints added to the router in the future therefore stay
 * private until somebody publishes them deliberately. Never invert this into a
 * denylist -- that would silently expose every route added later.
 *
 * Each entry is ['method' => '<METHOD>', 'path' => '<path>'], where <path> is the
 * route exactly as declared in backend/hooks/api.php, including any {param}
 * placeholders. Matching is on method + path, because the same path is often
 * registered for both GET (show) and POST (update).
 *
 * Entries are a plain list, so add-ons can append with array_merge(). Do not
 * reshape this into a map keyed by method or path -- array_merge() overwrites
 * string keys, so an add-on would silently wipe entries published here.
 *
 * Add-ons publish their own endpoints by appending to the
 * HookKeys::EXTERNAL_API_ALLOWED_ROUTES filter, so their routes stay with the
 * code that defines them rather than being listed here.
 */
final class AllowedRoutes
{
    /**
     * Published endpoints.
     *
     * Deliberately excluded, do not add:
     *
     * - Endpoints whose Request class has no authorize() method, so the only
     *   check they carry is "is logged in". This allowlist is the sole guard on
     *   them, so publishing one grants it to every key regardless of role:
     *   links/* (index, store, edit/{id}, update, delete), emails/{id},
     *   plugins/info, activities/upcoming, common/required-fields,
     *   common/entity-related-lists-count, common/sample-csv,
     *   common/related-field-options.
     *
     * - Admin plumbing that is not API surface, whatever its capability check:
     *   imaps/* (holds mail server credentials), plugins/install,
     *   settings/upsert, settings/business/*, settings/integration/*,
     *   onboarding/store, download-media, woocommerce/historical-sync/*.
     *
     * - UI-shaped endpoints (table-fields, fieldsWithOrder, ...). They return
     *   admin table configuration, so publishing them freezes internal shapes
     *   into a contract that cannot then be refactored.
     *
     * - emails/send and invoices/send (send outbound mail from the site),
     *   attachments/store (file ingestion) and trashes/delete, trashes/empty
     *   (permanent, unrestorable deletion). Each has a capability check, but
     *   they are consequential enough that publishing them must be its own
     *   decision.
     */
    private const ROUTES = [
        // Contacts
        ['method' => 'POST', 'path' => 'contacts/store'],
        ['method' => 'POST', 'path' => 'contacts/search'],
        ['method' => 'GET', 'path' => 'contacts/{id}'],
        ['method' => 'POST', 'path' => 'contacts/{id}'],
        ['method' => 'POST', 'path' => 'contacts/trash'],
        ['method' => 'POST', 'path' => 'contacts/attach-tag'],
        ['method' => 'POST', 'path' => 'contacts/detach-tag'],
        ['method' => 'POST', 'path' => 'contacts/attach-tags'],
        ['method' => 'POST', 'path' => 'contacts/detach-tags'],

        // Leads
        ['method' => 'POST', 'path' => 'leads/store'],
        ['method' => 'POST', 'path' => 'leads/search'],
        ['method' => 'GET', 'path' => 'leads/{id}'],
        ['method' => 'POST', 'path' => 'leads/{id}'],
        ['method' => 'POST', 'path' => 'leads/trash'],
        ['method' => 'POST', 'path' => 'leads/attach-tag'],
        ['method' => 'POST', 'path' => 'leads/detach-tag'],
        ['method' => 'POST', 'path' => 'leads/attach-tags'],
        ['method' => 'POST', 'path' => 'leads/detach-tags'],

        // Companies
        ['method' => 'POST', 'path' => 'companies/store'],
        ['method' => 'POST', 'path' => 'companies/search'],
        ['method' => 'GET', 'path' => 'companies/{id}'],
        ['method' => 'POST', 'path' => 'companies/{id}'],
        ['method' => 'POST', 'path' => 'companies/trash'],
        ['method' => 'POST', 'path' => 'companies/attach-tag'],
        ['method' => 'POST', 'path' => 'companies/detach-tag'],
        ['method' => 'POST', 'path' => 'companies/attach-tags'],
        ['method' => 'POST', 'path' => 'companies/detach-tags'],

        // Deals
        ['method' => 'POST', 'path' => 'deals/store'],
        ['method' => 'POST', 'path' => 'deals/search'],
        ['method' => 'GET', 'path' => 'deals/{id}'],
        ['method' => 'POST', 'path' => 'deals/{id}'],
        ['method' => 'POST', 'path' => 'deals/trash'],
        ['method' => 'POST', 'path' => 'deals/update-stage'],
        ['method' => 'GET', 'path' => 'deals/stages'],
        ['method' => 'POST', 'path' => 'deals/attach-tag'],
        ['method' => 'POST', 'path' => 'deals/detach-tag'],
        ['method' => 'POST', 'path' => 'deals/attach-tags'],
        ['method' => 'POST', 'path' => 'deals/detach-tags'],

        // Tags
        ['method' => 'POST', 'path' => 'tags/index'],
        ['method' => 'POST', 'path' => 'tags/store'],
        ['method' => 'POST', 'path' => 'tags/update'],
        ['method' => 'POST', 'path' => 'tags/delete'],

        // Notes
        ['method' => 'GET', 'path' => 'notes/index'],
        ['method' => 'POST', 'path' => 'notes/store'],
        ['method' => 'POST', 'path' => 'notes/update'],
        ['method' => 'POST', 'path' => 'notes/delete'],

        // Activities
        ['method' => 'GET', 'path' => 'activities/index'],
        ['method' => 'POST', 'path' => 'activities/store'],
        ['method' => 'POST', 'path' => 'activities/update'],
        ['method' => 'POST', 'path' => 'activities/update-status'],
        ['method' => 'POST', 'path' => 'activities/delete'],
        ['method' => 'GET', 'path' => 'activities/{id}'],

        // Activity history
        ['method' => 'GET', 'path' => 'activity-logs/index'],

        // Invoices
        ['method' => 'POST', 'path' => 'invoices/store'],
        ['method' => 'GET', 'path' => 'invoices/index'],
        ['method' => 'GET', 'path' => 'invoices/{id}'],
        ['method' => 'POST', 'path' => 'invoices/{id}'],
        ['method' => 'POST', 'path' => 'invoices/{id}/status'],
        ['method' => 'POST', 'path' => 'invoices/trash'],
        ['method' => 'GET', 'path' => 'invoices/deals/{id}'],
        ['method' => 'GET', 'path' => 'invoices/download'],
        ['method' => 'POST', 'path' => 'invoices/{id}/share-link'],
    ];

    /**
     * Checks whether an external caller may reach $method $path, where $path has
     * the REST namespace and version already stripped, e.g. 'contacts/123'.
     *
     * @param string $method
     * @param string $path
     *
     * @return bool
     */
    public static function isAllowed($method, $path)
    {
        $method = strtoupper((string) $method);
        $path = trim((string) $path, '/');

        foreach (self::all() as $entry) {
            // Malformed entry: skip it rather than risk allowing something.
            if (!isset($entry['method'], $entry['path'])) {
                continue;
            }

            if (strtoupper((string) $entry['method']) !== $method) {
                continue;
            }

            if (self::pathMatches((string) $entry['path'], $path)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Published endpoints, after add-on additions.
     */
    public static function all()
    {
        return (array) Hooks::applyFilter(HookKeys::EXTERNAL_API_ALLOWED_ROUTES, self::ROUTES);
    }

    /**
     * Matches a requested path against a route pattern.
     *
     * A {param} placeholder matches digits only, deliberately narrower than the
     * router's own [^/]+. The router registers literal routes shaped like its
     * parameterized ones -- 'contacts/fields' looks just like 'contacts/{id}' --
     * and resolves them by registration order, which this class cannot see. With
     * [^/]+, 'activities/{id}' alone would have re-published
     * 'activities/upcoming', one of the endpoints with no capability check.
     *
     * The trade-off is that a non-numeric parameter (e.g. 'invoices/terms/{key}')
     * has to be published as a literal entry. That fails closed -- a 403 on
     * something intended to be public, never the reverse.
     *
     * @param string $pattern
     * @param string $path
     *
     * @return bool
     */
    private static function pathMatches($pattern, $path)
    {
        $pattern = trim($pattern, '/');

        if (strpos($pattern, '{') === false) {
            return $pattern === $path;
        }

        // Word-character sentinel, so preg_quote() leaves it intact to swap after.
        $sentinel = '__BIT_CRM_ROUTE_PARAM__';
        $masked = preg_replace('/\{\w+\??\}/', $sentinel, $pattern);
        $regex = str_replace($sentinel, '\d+', preg_quote((string) $masked, '/'));

        return (bool) preg_match('/^' . $regex . '$/', $path);
    }
}
