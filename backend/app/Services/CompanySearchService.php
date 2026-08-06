<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Config;
use BitApps\Crm\Constants\HookKeys;
use BitApps\Crm\Deps\BitApps\WPDatabase\Connection;
use BitApps\Crm\Deps\BitApps\WPKit\Helpers\Arr;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Model\Company;
use BitApps\Crm\Traits\FormatPagination;
use Exception;
use Throwable;

class CompanySearchService
{
    use FormatPagination;

    public const COMPANY_TABLE_ALIAS = 'companies';

    public const OWNER_TABLE_ALIAS = 'users';

    public const MODULE = Company::MODULE_NAME;

    public function search(array $args)
    {
        if (!$this->validateArguments($args)) {
            throw new Exception(esc_html__('Invalid arguments.', 'bit-crm-sales-marketing-automation'));
        }

        $companyTable = Config::withDBPrefix('companies');
        $companyTableAlias = self::COMPANY_TABLE_ALIAS;
        $customFieldKeys = Hooks::applyFilter(HookKeys::CUSTOM_FIELDS_KEYS, [], self::MODULE);
        $allowedColumns = $this->allowedColumns($customFieldKeys);
        $customFieldsSelect = Hooks::applyFilter(HookKeys::CUSTOM_FIELDS_COLUMNS, '', self::MODULE);
        $customFieldsJoin = Hooks::applyFilter(HookKeys::CUSTOM_FIELDS_JOIN, '', self::MODULE);
        $ownerTableJoin = $this->getOwnerTableJoin();
        $ownerNameSelect = $this->getOwnerNameSelect();
        $parentNameSelect = $this->getParentNameSelect();
        $tagsFilter = $this->filterByTags($args['tags']);
        [$searchFilter, $searchBindings] = $this->filterBySearchTerm($args['searchTerm']);
        [$advancedFilters, $advancedFiltersBindings] = $this->advancedFilters($args['advancedFilterGroups'] ?? [], $allowedColumns);
        $select = "SELECT {$companyTableAlias}.*" . $ownerNameSelect . $parentNameSelect . ($customFieldsSelect ? ', ' . $customFieldsSelect : '');

        $baseQuery = "
        {$select}
        FROM {$companyTable} {$companyTableAlias}
        {$customFieldsJoin}
        {$ownerTableJoin}
        WHERE {$companyTableAlias}.status = 1 AND {$companyTableAlias}.is_trash = 0
        {$tagsFilter} {$searchFilter} GROUP BY {$companyTableAlias}.id {$advancedFilters}";

        $countQuery = $baseQuery;

        $sortBy = $this->sanitizeSortColumn($args['sortBy'], $allowedColumns);

        $baseQuery .= " ORDER BY `{$sortBy}` {$args['sortOrder']} LIMIT {$args['perPage']} OFFSET {$args['offset']}";
        $bindings = array_merge($searchBindings, $advancedFiltersBindings);

        try {
            $data = Company::raw($baseQuery, $bindings) ?? [];
        } catch (Throwable $th) {
            throw new Exception(esc_html__('Failed to search companies.', 'bit-crm-sales-marketing-automation'));
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
        $companyTableAlias = self::COMPANY_TABLE_ALIAS;

        return " 
            AND `{$companyTableAlias}`.`id` IN (
                SELECT DISTINCT `{$tagEntityTable}`.`entity_id`
                FROM `{$tagEntityTable}`
                WHERE `{$tagEntityTable}`.`module` = '{$module}'
                AND `{$tagEntityTable}`.`tag_id` IN ({$tagsPlaceholder})
            )";
    }

    private function filterBySearchTerm(string $searchTerm): array
    {
        if (empty($searchTerm)) {
            return [null, []];
        }

        $companyTableAlias = self::COMPANY_TABLE_ALIAS;
        $filterConditions = [];
        $bindings = [];
        $escapedSearchTerm = Connection::esc_like(strtolower($searchTerm));

        foreach (Company::STATIC_SEARCHABLE_FIELDS as $field) {
            $filterConditions[] = "{$companyTableAlias}.{$field} LIKE '%%%s%%'";
            $bindings[] = $escapedSearchTerm;
        }

        $filter = ' AND (' . implode(' OR ', $filterConditions) . ')';

        return [$filter, $bindings];
    }

    private function filterByIndividualFields(array $searchTerms): array
    {
        if (empty($searchTerms)) {
            return [null, []];
        }

        $search = ' HAVING';
        $bindings = [];
        foreach ($searchTerms as $key => $value) {
            $value = sanitize_text_field(strtolower($value));
            $search .= " `{$key}` LIKE '%%%s%%' AND";
            $bindings[] = Connection::esc_like("{$value}");
        }

        return [rtrim($search, 'AND'), $bindings];
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
     * Real company columns plus registered custom fields, which together are every
     * key the fields endpoint exposes as a sortable or filterable table column.
     *
     * Both clauses interpolate the identifier into a raw query, so nothing outside
     * this list may reach the SQL.
     */
    private function allowedColumns(array $customFieldKeys): array
    {
        return array_merge(
            (new Company())->getFillable(),
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
            $totalQuery = Company::raw("SELECT COUNT(*) as total FROM ({$query}) as total_query", $bindings);
        } catch (Throwable $th) {
            return $count;
        }

        if (isset($totalQuery[0], $totalQuery[0]->total)) {
            $count = (int) $totalQuery[0]->total;
        }

        return $count;
    }

    private function getOwnerTableJoin(): string
    {
        $wpUsersTable = Config::get('WP_DB_PREFIX') . 'users';
        $ownerTableAlias = self::OWNER_TABLE_ALIAS;
        $companyTableAlias = self::COMPANY_TABLE_ALIAS;

        return " LEFT JOIN {$wpUsersTable} {$ownerTableAlias} ON {$companyTableAlias}.owner_id = {$ownerTableAlias}.ID AND {$companyTableAlias}.owner_id IS NOT NULL AND {$companyTableAlias}.owner_id <> '' ";
    }

    private function getOwnerNameSelect(): string
    {
        $ownerTableAlias = self::OWNER_TABLE_ALIAS;

        return ", {$ownerTableAlias}.display_name AS owner_name";
    }

    private function getParentNameSelect(): string
    {
        $companyTable = Config::withDBPrefix('companies');
        $companyTableAlias = self::COMPANY_TABLE_ALIAS;

        return ", (
            SELECT name
            FROM {$companyTable} AS parent
            WHERE parent.id = {$companyTableAlias}.parent_id
            AND parent.is_trash = 0
            LIMIT 1
        ) AS parent_name";
    }

    private function validateArguments(array $args): bool
    {
        $keys = ['perPage', 'offset', 'page', 'sortBy', 'sortOrder', 'searchTerm', 'filters', 'tags'];

        return Arr::has($args, $keys);
    }
}
