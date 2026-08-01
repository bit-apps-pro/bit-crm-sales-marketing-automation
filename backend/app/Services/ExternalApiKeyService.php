<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Config;
use BitApps\Crm\src\UserPermissions\Roles;
use WP_Application_Passwords;
use WP_Error;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Application Password management for the external REST API.
 *
 * Thin wrapper over core's WP_Application_Passwords. Core owns the storage and
 * hashing; this only decides which users may hold a key and shapes the data for
 * the settings screen.
 */
class ExternalApiKeyService
{
    public const ENABLED_OPTION = 'external_api_enabled';

    /**
     * Current state of the external API, for the settings screen.
     */
    public function settings(): array
    {
        return [
            'enabled'   => (bool) Config::getOption(self::ENABLED_OPTION, 1),
            'available' => \function_exists('wp_is_application_passwords_available')
                && wp_is_application_passwords_available(),
            'baseUrl' => Config::get('API_BASE'),
        ];
    }

    /**
     * Stores 1/0 rather than a raw boolean.
     *
     * update_option() casts false to an empty string, which is what get_option()
     * also yields for a row that was never written -- so an intentional "off"
     * would be indistinguishable from "unset" and fall back to the enabled
     * default on every read.
     */
    public function updateEnabled(bool $enabled): bool
    {
        return Config::updateOption(self::ENABLED_OPTION, $enabled ? 1 : 0);
    }

    /**
     * Eligible users for one page, each with the keys they hold.
     *
     * Pagination is on users rather than keys because keys have no table of
     * their own -- core stores them as one serialized blob per user in usermeta.
     * The database can therefore page through users, and only the users on the
     * current page have their blob read. Paging by key instead would mean
     * loading every eligible user's blob on every request.
     */
    public function usersWithKeys(int $page, int $perPage): array
    {
        $userService = new UserService();

        $users = $userService->getPaginatedUsers(
            [
                // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query -- Required to list only key holders
                'meta_query' => [
                    'relation' => 'AND',
                    $userService->getMetaQueryForRoleFilter(),
                    self::hasKeysMetaQuery(),
                ],
                'paged'  => $page,
                'number' => $perPage,
            ]
        );

        $users['data'] = array_map(fn ($user) => $this->formatUserWithKeys($user), $users['data']);

        return $users;
    }

    /**
     * Creates a key and returns it together with its plaintext password.
     *
     * The plaintext is available here and nowhere else -- core stores only a
     * one-way hash -- so the caller must surface it immediately.
     *
     * @return array|WP_Error
     */
    public function create(int $userId, string $name)
    {
        $created = WP_Application_Passwords::create_new_application_password($userId, ['name' => $name]);

        if (is_wp_error($created)) {
            return $created;
        }

        [$password, $item] = $created;
        $user = get_userdata($userId);

        return [
            'password' => WP_Application_Passwords::chunk_password($password),
            'uuid'     => $item['uuid'],
            'name'     => $item['name'],
            'userName' => $user
                ? $user->display_name . ($user->user_email ? ' (' . $user->user_email . ')' : '')
                : '',
        ];
    }

    public function delete(int $userId, string $uuid): bool
    {
        return (bool) WP_Application_Passwords::delete_application_password($userId, $uuid);
    }

    /**
     * Matches only users who currently hold at least one key.
     *
     * A '!=' comparison against the serialized empty array covers both cases in
     * one clause: users who never held a key have no row at all, and users who
     * revoked their last key keep a row holding an empty array, because core
     * writes array() rather than deleting the meta.
     */
    private static function hasKeysMetaQuery(): array
    {
        return [
            'key'     => WP_Application_Passwords::USERMETA_KEY_APPLICATION_PASSWORDS,
            'value'   => maybe_serialize([]),
            'compare' => '!=',
        ];
    }

    /**
     * Whether this user's keys are exempt from every capability check.
     *
     * Mirrors Capability::check(), which short-circuits on the administrator
     * role -- not on a capability. Testing 'manage_options' instead would flag
     * custom roles granted that capability, which do not actually bypass, and
     * the badge would then be warning about something that is not true of them.
     */
    private static function bypassesCapabilityChecks(int $userId): bool
    {
        $user = get_userdata($userId);

        return $user && \in_array(Roles::ADMINISTRATOR, $user->roles, true);
    }

    /**
     * Shapes one user row together with the keys they hold, newest key first.
     *
     * @param object $user Result of a WP_User_Query with an explicit field list
     */
    private function formatUserWithKeys($user): array
    {
        $userId = (int) $user->ID;

        $keys = array_map(
            static fn ($password) => [
                'uuid'     => $password['uuid'],
                'name'     => $password['name'],
                'created'  => empty($password['created']) ? null : (int) $password['created'],
                'lastUsed' => empty($password['last_used']) ? null : (int) $password['last_used'],
                'lastIp'   => empty($password['last_ip']) ? null : $password['last_ip'],
            ],
            WP_Application_Passwords::get_user_application_passwords($userId)
        );

        usort($keys, static fn ($a, $b) => ($b['created'] ?? 0) <=> ($a['created'] ?? 0));

        return [
            'id'       => $userId,
            'name'     => $user->display_name,
            'email'    => $user->user_email,
            'isAdmin'  => self::bypassesCapabilityChecks($userId),
            'profile'  => get_edit_user_link($userId),
            'keys'     => $keys,
            'keyCount' => \count($keys),
        ];
    }
}
