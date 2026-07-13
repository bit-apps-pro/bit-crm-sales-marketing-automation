<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Config;
use BitApps\Crm\Constants\HookKeys;
use BitApps\Crm\Deps\BitApps\WPDatabase\Connection;
use BitApps\Crm\Deps\BitApps\WPKit\Helpers\Arr;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Model\Deal;
use BitApps\Crm\Utils\Logger;
use Throwable;

class DealKanbanSearchService
{
    public const DEAL_TABLE_ALIAS = 'deals';

    public const COMPANY_TABLE_ALIAS = 'companies';

    public const CONTACT_TABLE_ALIAS = 'contacts';

    public const OWNER_TABLE_ALIAS = 'users';

    public const MODULE = Deal::MODULE_NAME;

    public function search(array $args)
    {
        $data = ['data' => [], 'total' => 0, 'stageStatistics' => []];

        if (!$this->validateArguments($args)) {
            return $data;
        }

        $dealTable = Config::withDBPrefix('deals');
        $dealTableAlias = self::DEAL_TABLE_ALIAS;
        $customFieldsSelect = Hooks::applyFilter(HookKeys::CUSTOM_FIELDS_COLUMNS, '', self::MODULE);
        $customFieldsJoin = Hooks::applyFilter(HookKeys::CUSTOM_FIELDS_JOIN, '', self::MODULE);
        $companyTableJoin = $this->getCompanyTableJoin();
        $companyNameSelect = $this->getCompanyNameSelect();
        $contactTableJoin = $this->getContactTableJoin();
        $contactNameSelect = $this->getContactNameSelect();
        $ownerTableJoin = $this->getOwnerTableJoin();
        $ownerNameSelect = $this->getOwnerNameSelect();
        $tagsFilter = $this->filterByTags($args['tags'], $dealTableAlias);
        [$searchFilter, $searchBindings] = $this->filterBySearchTerm($args['searchTerm'], $dealTableAlias);
        [$advancedFilter, $advancedFilterBindings] = $this->advancedFilters($args['advancedFilterGroups'] ?? []);
        $havingClause = $advancedFilter;
        $havingBindings = $advancedFilterBindings;

        $select = $this->generateSelectClause($dealTableAlias, $customFieldsSelect, $companyNameSelect, $contactNameSelect, $ownerNameSelect);
        $whereConditions = $this->generateWhereConditions($dealTableAlias, $tagsFilter, $searchFilter);
        $orderBy = "ORDER BY {$dealTableAlias}.{$args['sortBy']} {$args['sortOrder']}";
        $limit = "LIMIT {$args['perPage']}";

        $unionQueries = [];
        $allBindings = [];

        $stages = (new DealStageService())->getAllStages(DealStageService::STATUS_ACTIVE);

        foreach (array_keys($stages) as $stage) {
            $stageCondition = "{$dealTableAlias}.stage = %s";
            $stageBindings = array_merge([$stage], $searchBindings, $havingBindings);

            if ($customFieldsJoin) {
                $groupBy = "GROUP BY {$dealTableAlias}.id";
                $unionQuery = "
                (SELECT {$select}
                FROM {$dealTable} {$dealTableAlias}
                {$customFieldsJoin}
                {$companyTableJoin}
                {$contactTableJoin}
                {$ownerTableJoin}
                WHERE {$stageCondition} AND {$whereConditions}
                {$groupBy} {$havingClause}
                {$orderBy}
                {$limit})";
            } else {
                $unionQuery = "
                (SELECT {$select}
                FROM {$dealTable} {$dealTableAlias}
                {$companyTableJoin}
                {$contactTableJoin}
                {$ownerTableJoin}
                WHERE {$stageCondition} AND {$whereConditions} {$havingClause}
                {$orderBy}
                {$limit})";
            }

            $unionQueries[] = $unionQuery;
            $allBindings = array_merge($allBindings, $stageBindings);
        }

        $baseQuery = implode(' UNION ALL ', $unionQueries);

        $data['data'] = self::getDeals($baseQuery, $allBindings);
        $data['total'] = 0; // TODO: will update later if needed
        $data['stageStatistics'] = $this->getStageStatistics($tagsFilter, $searchFilter, $searchBindings, $havingClause, $havingBindings);

        return $data;
    }

    private function generateSelectClause(string $dealTableAlias, string $customFieldsSelect, string $companyNameSelect, string $contactNameSelect, string $ownerNameSelect): string
    {
        $select = $dealTableAlias . '.*' . $companyNameSelect . $contactNameSelect . $ownerNameSelect;

        if ($customFieldsSelect) {
            $select .= ', ' . $customFieldsSelect;
        }

        return $select;
    }

    private function generateWhereConditions(string $dealTableAlias, ?string $tagsFilter, ?string $searchFilter): string
    {
        $conditions = [
            "{$dealTableAlias}.status = 1",
            "{$dealTableAlias}.is_trash = 0",
        ];

        $whereClause = implode(' AND ', $conditions);

        if ($tagsFilter) {
            $whereClause .= ' AND ' . ltrim($tagsFilter, ' AND');
        }

        if ($searchFilter) {
            $whereClause .= ' AND ' . ltrim($searchFilter, ' AND');
        }

        return $whereClause;
    }

    private function filterByTags(array $tags, string $dealTableAlias): ?string
    {
        if (empty($tags)) {
            return null;
        }

        $tagEntityTable = Config::withDBPrefix('tag_entity');

        $tagsPlaceholder = implode(',', array_map('intval', $tags));

        $module = self::MODULE;

        return "{$dealTableAlias}.id IN (
                SELECT DISTINCT {$tagEntityTable}.entity_id
                FROM {$tagEntityTable}
                WHERE {$tagEntityTable}.module = '{$module}'
                AND {$tagEntityTable}.tag_id IN ({$tagsPlaceholder})
            )";
    }

    private function filterBySearchTerm(string $searchTerm, string $dealTableAlias): array
    {
        if (empty($searchTerm)) {
            return [null, []];
        }

        $filterConditions = [];
        $bindings = [];
        $escapedSearchTerm = Connection::esc_like(strtolower($searchTerm));

        foreach (Deal::STATIC_SEARCHABLE_FIELDS as $field) {
            $filterConditions[] = "{$dealTableAlias}.{$field} LIKE '%%%s%%'";
            $bindings[] = $escapedSearchTerm;
        }

        $filter = '(' . implode(' OR ', $filterConditions) . ')';

        return [$filter, $bindings];
    }

    private function advancedFilters(array $filters): array
    {
        if (empty($filters)) {
            return [null, []];
        }

        $advancedFilterService = new AdvancedFilterService(Hooks::applyFilter(HookKeys::CUSTOM_FIELDS_KEYS, [], self::MODULE));

        return $advancedFilterService->applyAdvancedFilters($filters);
    }

    private function validateArguments(array $args): bool
    {
        $keys = ['perPage', 'offset', 'sortBy', 'sortOrder', 'searchTerm', 'tags', 'advancedFilterGroups'];

        return Arr::has($args, $keys);
    }

    private function getStageStatistics(?string $tagsFilter, ?string $searchFilter, array $searchBindings, ?string $havingClause, array $havingBindings): array
    {
        $dealTable = Config::withDBPrefix('deals');
        $dealTableAlias = self::DEAL_TABLE_ALIAS;
        $customFieldsJoin = Hooks::applyFilter(HookKeys::CUSTOM_FIELDS_JOIN, '', self::MODULE);
        $customFieldsSelect = Hooks::applyFilter(HookKeys::CUSTOM_FIELDS_COLUMNS, '', self::MODULE);

        $whereConditions = "{$dealTableAlias}.status = 1 AND {$dealTableAlias}.is_trash = 0";

        if ($tagsFilter) {
            $whereConditions .= " AND {$tagsFilter}";
        }

        if ($searchFilter) {
            $whereConditions .= " AND {$searchFilter}";
        }

        $allBindings = array_merge($searchBindings, $havingBindings);

        if ($customFieldsJoin && $havingClause) {
            $groupBy = "GROUP BY {$dealTableAlias}.id";
            $statsQuery = "
            SELECT
                stage_data.stage,
                COUNT(stage_data.id) as count,
                COALESCE(SUM(CAST(stage_data.home_currency_amount AS DECIMAL(17, 2))), 0) as total_amount
            FROM (
                SELECT
                    {$dealTableAlias}.*, {$customFieldsSelect}
                FROM {$dealTable} {$dealTableAlias}
                {$customFieldsJoin}
                WHERE {$whereConditions}
                {$groupBy} {$havingClause}
            ) stage_data
            GROUP BY stage_data.stage";
        } elseif ($havingClause) {
            $groupBy = "GROUP BY {$dealTableAlias}.id";
            $statsQuery = "
            SELECT
                stage_data.stage,
                COUNT(stage_data.id) as count,
                COALESCE(SUM(CAST(stage_data.home_currency_amount AS DECIMAL(17, 2))), 0) as total_amount
            FROM (
                SELECT
                    {$dealTableAlias}.*
                FROM {$dealTable} {$dealTableAlias}
                WHERE {$whereConditions}
                {$groupBy} {$havingClause}
            ) stage_data
            GROUP BY stage_data.stage";
        } else {
            $statsQuery = "
            SELECT
                {$dealTableAlias}.stage,
                COUNT({$dealTableAlias}.id) as count,
                COALESCE(SUM(CAST({$dealTableAlias}.home_currency_amount AS DECIMAL(17, 2))), 0) as total_amount
            FROM {$dealTable} {$dealTableAlias}
            WHERE {$whereConditions}
            GROUP BY {$dealTableAlias}.stage";
        }

        try {
            $results = Deal::raw($statsQuery, $allBindings);
        } catch (Throwable $th) {
            return [];
        }

        $statistics = [];
        foreach ($results as $row) {
            $statistics[$row->stage] = [
                'count'       => (int) $row->count,
                'totalAmount' => (float) $row->total_amount
            ];
        }

        return $statistics;
    }

    private static function getDeals($query, $bindings)
    {
        try {
            Deal::raw($query, $bindings);

            return Connection::prop('last_result');
        } catch (Throwable $th) {
            Logger::error('Query failed: ' . $th->getMessage());

            return [];
        }
    }

    private function getCompanyTableJoin(): string
    {
        $companyTable = Config::withDBPrefix('companies');
        $companyTableAlias = self::COMPANY_TABLE_ALIAS;
        $dealTableAlias = self::DEAL_TABLE_ALIAS;

        return " LEFT JOIN {$companyTable} {$companyTableAlias} ON {$dealTableAlias}.company_id = {$companyTableAlias}.id AND {$companyTableAlias}.is_trash = 0 AND {$dealTableAlias}.company_id IS NOT NULL AND {$dealTableAlias}.company_id <> '' ";
    }

    private function getCompanyNameSelect(): string
    {
        $companyTableAlias = self::COMPANY_TABLE_ALIAS;

        return ", {$companyTableAlias}.name AS company_name";
    }

    private function getContactTableJoin(): string
    {
        $contactTable = Config::withDBPrefix('contacts');
        $contactTableAlias = self::CONTACT_TABLE_ALIAS;
        $dealTableAlias = self::DEAL_TABLE_ALIAS;

        return " LEFT JOIN {$contactTable} {$contactTableAlias} ON {$dealTableAlias}.contact_id = {$contactTableAlias}.id AND {$contactTableAlias}.is_trash = 0 AND {$dealTableAlias}.contact_id IS NOT NULL AND {$dealTableAlias}.contact_id <> '' ";
    }

    private function getContactNameSelect(): string
    {
        $contactTableAlias = self::CONTACT_TABLE_ALIAS;

        return ", CONCAT_WS(' ', {$contactTableAlias}.first_name, {$contactTableAlias}.last_name) AS contact_name";
    }

    private function getOwnerTableJoin(): string
    {
        $usersTable = 'wp_users';
        $ownerTableAlias = self::OWNER_TABLE_ALIAS;
        $dealTableAlias = self::DEAL_TABLE_ALIAS;

        return " LEFT JOIN {$usersTable} {$ownerTableAlias} ON {$dealTableAlias}.owner_id = {$ownerTableAlias}.ID AND {$dealTableAlias}.owner_id IS NOT NULL AND {$dealTableAlias}.owner_id <> '' ";
    }

    private function getOwnerNameSelect(): string
    {
        $ownerTableAlias = self::OWNER_TABLE_ALIAS;

        return ", {$ownerTableAlias}.display_name AS owner_name";
    }
}
