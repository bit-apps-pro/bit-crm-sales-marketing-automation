<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Config;
use BitApps\Crm\Interfaces\UserInterface;
use BitApps\Crm\Traits\FormatPagination;
use WP_User_Query;

class UserService implements UserInterface
{
    use FormatPagination;

    public const OWNER_LOOKUP_FIELD_KEY = 'owner_id';

    // users (wp) does not have any model, so we define module name here for consistency
    public const MODULE_NAME = 'user';

    public function getUsers(array $args = []): array
    {
        $defaultArgs = [
            'fields' => ['ID', 'display_name', 'user_email'],
        ];

        if (isset($args['role_filter']) && $args['role_filter'] === Config::SLUG) {
            // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query -- Required for role filtering
            $args['meta_query'] = $this->getMetaQueryForRoleFilter();

            unset($args['role_filter']);
        }

        $searchTerm = !empty($args['search_term']) ? sanitize_text_field($args['search_term']) : null;

        if ($searchTerm) {
            $args['search'] = '*' . $searchTerm . '*';
            $args['search_columns'] = ['display_name'];
            unset($args['search_term']);
        }

        $args = array_merge($defaultArgs, $args);

        return get_users($args);
    }

    public function getPaginatedUsers(array $args = []): array
    {
        $defaultArgs = [
            'fields'      => ['ID', 'display_name', 'user_email'],
            'count_total' => true,
        ];

        if (isset($args['role_filter']) && $args['role_filter'] === Config::SLUG) {
            // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query -- Required for role filtering
            $args['meta_query'] = $this->getMetaQueryForRoleFilter();

            unset($args['role_filter']);
        }

        $searchTerm = !empty($args['search_term']) ? sanitize_text_field($args['search_term']) : null;

        if ($searchTerm) {
            $args['search'] = '*' . $searchTerm . '*';
            $args['search_columns'] = ['display_name'];
            unset($args['search_term']);
        }

        $args = array_merge($defaultArgs, $args);
        $query = new WP_User_Query($args);
        $users = $query->get_results();
        $totalUsers = $query->get_total();

        return $this->formatPagination($users, $args['paged'] ?? 1, $args['number'] ?? 10, $totalUsers);
    }

    public function getUsersAsOptions(array|bool $pagination = false, ?string $searchTerm = null, ?array $args = []): array
    {
        if (\is_array($pagination) && isset($pagination['pageNo'], $pagination['perPage'])) {
            $users = $this->getPaginatedUsers(
                [
                    'paged'       => $pagination['pageNo'],
                    'number'      => $pagination['perPage'],
                    'search_term' => $searchTerm,
                    ...$args
                ]
            );
            $options = $this->formatDataAsOptions($users['data']);
            $users['data'] = $options;

            return $users;
        }

        $users = $this->getUsers(['search_term' => $searchTerm, ...$args]);

        return $this->formatDataAsOptions($users);
    }

    /**
     * Get entities as options for dropdowns and select fields.
     *
     * This method is a wrapper around getUsersAsOptions to maintain consistency
     * with other entity services.
     *
     * @param array|bool $pagination Pagination info or false for no pagination
     * @param int $skipId ID to skip from results
     * @param null|string $searchTerm Search term to filter results
     *
     * @return array formatted entities as options
     */
    public function getEntitiesAsOptions(array|bool $pagination = false, int $skipId = 0, ?string $searchTerm = null, ?array $args = []): array
    {
        return $this->getUsersAsOptions($pagination, $searchTerm, $args);
    }

    public function getUserAsOption(int $id): array|bool
    {
        $user = get_user_by('ID', $id);

        if (!$user) {
            return false;
        }

        return [
            'value' => $user->ID,
            'label' => $user->display_name,
        ];
    }

    public function getEntityAsOption(int $id): array|bool
    {
        return $this->getUserAsOption($id);
    }

    private function formatDataAsOptions(array $users): array
    {
        return array_map(
            fn ($user) => [
                'value' => $user->ID,
                'label' => $user->display_name,
            ],
            $users
        );
    }

    private function getMetaQueryForRoleFilter(): array
    {
        return [
            'relation' => 'OR',
            [
                'key'     => Config::get('WP_BLOG_PREFIX') . 'capabilities',
                'value'   => '"administrator"',
                'compare' => 'LIKE',
            ],
            [
                'key'   => CrmUserService::HAS_CRM_CAPABILITIES_META_KEY,
                'value' => true,
            ],
        ];
    }
}
