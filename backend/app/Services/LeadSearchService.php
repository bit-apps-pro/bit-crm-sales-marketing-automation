<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Config;
use BitApps\Crm\Constants\HookKeys;
use BitApps\Crm\Deps\BitApps\WPDatabase\Connection;
use BitApps\Crm\Deps\BitApps\WPKit\Helpers\Arr;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Model\Lead;
use BitApps\Crm\Traits\FormatPagination;
use Exception;
use Throwable;

class LeadSearchService
{
    use FormatPagination;

    public const LEAD_TABLE_ALIAS = 'leads';

    public const OWNER_TABLE_ALIAS = 'users';

    public const MODULE = Lead::MODULE_NAME;

    public function search(array $args)
    {
        if (!$this->validateArguments($args)) {
            throw new Exception(esc_html__('Invalid arguments.', 'bit-crm-sales-marketing-automation'));
        }

        $leadTable = Config::withDBPrefix('leads');
        $leadTableAlias = self::LEAD_TABLE_ALIAS;
        $customFieldKeys = Hooks::applyFilter(HookKeys::CUSTOM_FIELDS_KEYS, [], self::MODULE);
        $allowedColumns = $this->allowedColumns($customFieldKeys);
        $customFieldsSelect = Hooks::applyFilter(HookKeys::CUSTOM_FIELDS_COLUMNS, '', self::MODULE);
        $customFieldsJoin = Hooks::applyFilter(HookKeys::CUSTOM_FIELDS_JOIN, '', self::MODULE);
        $tagsFilter = $this->filterByTags($args['tags']);
        $idsFilter = $this->filterByIds($args['ids']);
        [$searchFilter, $searchBindings] = $this->filterBySearchTerm($args['searchTerm']);
        [$advancedFilters, $advancedFiltersBindings] = $this->advancedFilters($args['advancedFilterGroups'] ?? [], $allowedColumns);
        $ownerTableJoin = $this->getOwnerTableJoin();
        $ownerNameSelect = $this->getOwnerNameSelect();
        $select = "SELECT {$leadTableAlias}.*" . $ownerNameSelect . ($customFieldsSelect ? ', ' . $customFieldsSelect : '');

        $baseQuery = "
        {$select}
        FROM {$leadTable} {$leadTableAlias}
        {$customFieldsJoin}
        {$ownerTableJoin}
        WHERE {$leadTableAlias}.is_converted = 0 AND {$leadTableAlias}.is_trash = 0
        {$tagsFilter} {$idsFilter} {$searchFilter} GROUP BY {$leadTableAlias}.id {$advancedFilters}";

        $countQuery = $baseQuery;

        $sortBy = $this->sanitizeSortColumn($args['sortBy'], $allowedColumns);

        $baseQuery .= " ORDER BY `{$sortBy}` {$args['sortOrder']} LIMIT {$args['perPage']} OFFSET {$args['offset']}";

        $bindings = array_merge($searchBindings, $advancedFiltersBindings);

        try {
            $data = Lead::raw($baseQuery, $bindings) ?? [];
        } catch (Throwable $th) {
            throw new Exception(esc_html__('Failed to fetch leads.', 'bit-crm-sales-marketing-automation'));
        }

        $total = \count($data) > 0 ? $this->totalData($countQuery, $bindings) : 0;

        return $this->formatPagination($data, $args['page'], $args['perPage'], $total);
    }

    private function filterByTags(array $tags): ?string
    {
        if (empty($tags)) {
            return null;
        }

        $tagEntityTable = Config::withDBPrefix('tag_entity');

        $tagsPlaceholder = implode(',', array_map('intval', $tags));

        $module = self::MODULE;
        $leadTableAlias = self::LEAD_TABLE_ALIAS;

        return " 
            AND `{$leadTableAlias}`.`id` IN (
                SELECT DISTINCT `{$tagEntityTable}`.`entity_id`
                FROM `{$tagEntityTable}`
                WHERE `{$tagEntityTable}`.`module` = '{$module}'
                AND `{$tagEntityTable}`.`tag_id` IN ({$tagsPlaceholder})
            )";
    }

    private function filterByIds(array $ids): ?string
    {
        if (empty($ids)) {
            return null;
        }

        $leadTableAlias = self::LEAD_TABLE_ALIAS;
        $leadIdsPlaceholder = implode(',', array_map('intval', $ids));

        return " AND `{$leadTableAlias}`.`id` IN ({$leadIdsPlaceholder})";
    }

    private function filterBySearchTerm(string $searchTerm): array
    {
        if (empty($searchTerm)) {
            return [null, []];
        }

        $searchTerm = strtolower($searchTerm);

        $leadTableAlias = self::LEAD_TABLE_ALIAS;

        $filter = " 
        AND ({$leadTableAlias}.first_name LIKE '%%%s%%' 
        OR {$leadTableAlias}.last_name LIKE '%%%s%%' 
        OR {$leadTableAlias}.email LIKE '%%%s%%')";

        $bindings = [Connection::esc_like("{$searchTerm}"), Connection::esc_like("{$searchTerm}"), Connection::esc_like("{$searchTerm}")];

        return [$filter, $bindings];
    }

    private function advancedFilters(array $filters, array $allowedColumns): array
    {
        if (empty($filters)) {
            return [null, []];
        }

        $advancedFilterService = new AdvancedFilterService($allowedColumns);

        return $advancedFilterService->applyAdvancedFilters($filters);
    }

    /**
     * Real lead columns plus registered custom fields, which together are every
     * key the fields endpoint exposes as a sortable or filterable table column.
     *
     * Both clauses interpolate the identifier into a raw query, so nothing outside
     * this list may reach the SQL.
     */
    private function allowedColumns(array $customFieldKeys): array
    {
        return array_merge(
            (new Lead())->getFillable(),
            ['id', 'created_at', 'updated_at'],
            $customFieldKeys
        );
    }

    /**
     * @param mixed $sortBy
     */
    private function sanitizeSortColumn($sortBy, array $allowedColumns): string
    {
        return \in_array($sortBy, $allowedColumns, true) ? $sortBy : 'id';
    }

    private function totalData(string $query, $bindings): int
    {
        $count = 0;

        try {
            $totalQuery = Lead::raw("SELECT COUNT(*) as total FROM ({$query}) as total_query", $bindings);
        } catch (Throwable $th) {
            return $count;
        }

        if (isset($totalQuery[0], $totalQuery[0]->total)) {
            $count = (int) $totalQuery[0]->total;
        }

        return $count;
    }

    private function validateArguments(array $args): bool
    {
        $keys = ['perPage', 'page', 'offset', 'sortBy', 'sortOrder', 'searchTerm', 'filters', 'tags', 'ids'];

        return Arr::has($args, $keys);
    }

    private function getOwnerTableJoin(): string
    {
        $wpUsersTable = Config::get('WP_DB_PREFIX') . 'users';
        $ownerTableAlias = self::OWNER_TABLE_ALIAS;
        $leadTableAlias = self::LEAD_TABLE_ALIAS;

        return " LEFT JOIN {$wpUsersTable} {$ownerTableAlias} ON {$leadTableAlias}.owner_id = {$ownerTableAlias}.ID AND {$leadTableAlias}.owner_id IS NOT NULL AND {$leadTableAlias}.owner_id <> '' ";
    }

    private function getOwnerNameSelect(): string
    {
        $ownerTableAlias = self::OWNER_TABLE_ALIAS;

        return ", {$ownerTableAlias}.display_name AS owner_name";
    }
}
