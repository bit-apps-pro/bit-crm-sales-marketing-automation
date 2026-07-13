<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Config;
use BitApps\Crm\Constants\HookKeys;
use BitApps\Crm\Deps\BitApps\WPDatabase\Connection;
use BitApps\Crm\Deps\BitApps\WPKit\Helpers\Arr;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Model\Deal;
use BitApps\Crm\Traits\FormatPagination;
use Exception;
use Throwable;

class DealSearchService
{
    use FormatPagination;

    public const DEAL_TABLE_ALIAS = 'deals';

    public const CONTACT_TABLE_ALIAS = 'contacts';

    public const COMPANY_TABLE_ALIAS = 'companies';

    public const OWNER_TABLE_ALIAS = 'users';

    public const MODULE = Deal::MODULE_NAME;

    public function search(array $args)
    {
        if (!$this->validateArguments($args)) {
            throw new Exception(esc_html__('Invalid arguments.', 'bit-crm'));
        }

        $dealTable = Config::withDBPrefix('deals');
        $dealTableAlias = self::DEAL_TABLE_ALIAS;
        $customFieldsSelect = Hooks::applyFilter(HookKeys::CUSTOM_FIELDS_COLUMNS, '', self::MODULE);
        $customFieldsJoin = Hooks::applyFilter(HookKeys::CUSTOM_FIELDS_JOIN, '', self::MODULE);
        $contactTableJoin = $this->getContactTableJoin();
        $contactNameSelect = $this->getContactNameSelect();
        $companyTableJoin = $this->getCompanyTableJoin();
        $companyNameSelect = $this->getCompanyNameSelect();
        $ownerTableJoin = $this->getOwnerTableJoin();
        $ownerNameSelect = $this->getOwnerNameSelect();
        $select = "SELECT {$dealTableAlias}.*" . $contactNameSelect . $companyNameSelect . $ownerNameSelect . ($customFieldsSelect ? ', ' . $customFieldsSelect : '');

        $baseQuery = "
        {$select}
        FROM {$dealTable} {$dealTableAlias}
        {$customFieldsJoin}
        {$contactTableJoin}
        {$companyTableJoin}
        {$ownerTableJoin}
        WHERE {$dealTableAlias}.is_trash = 0";

        [$advancedFilters, $advancedFiltersBindings] = $this->advancedFilters($args['advancedFilterGroups'] ?? []);
        $baseQuery .= $this->filterByTags($args['tags']);
        $baseQuery .= $this->filterByIds($args['ids'] ?? []);
        [$searchFilter, $searchBindings] = $this->filterBySearchTerm($args['searchTerm']);
        $baseQuery .= $searchFilter . " GROUP BY {$dealTableAlias}.id {$advancedFilters}";

        $countQuery = $baseQuery;

        $baseQuery .= " ORDER BY `{$args['sortBy']}` {$args['sortOrder']} LIMIT {$args['perPage']} OFFSET {$args['offset']}";
        $bindings = array_merge($searchBindings, $advancedFiltersBindings);

        try {
            $data = Deal::raw($baseQuery, $bindings) ?? [];
        } catch (Throwable $th) {
            throw new Exception(esc_html__('Failed to fetch deals.', 'bit-crm'));
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
        $dealTableAlias = self::DEAL_TABLE_ALIAS;

        return " 
            AND `{$dealTableAlias}`.`id` IN (
                SELECT DISTINCT `{$tagEntityTable}`.`entity_id`
                FROM `{$tagEntityTable}`
                WHERE `{$tagEntityTable}`.`module` = '{$module}'
                AND `{$tagEntityTable}`.`tag_id` IN ({$tagsPlaceholder})
            )
        ";
    }

    private function filterByIds(array $ids): ?string
    {
        if (empty($ids)) {
            return null;
        }

        $dealTableAlias = self::DEAL_TABLE_ALIAS;
        $idsPlaceholder = implode(',', array_map('intval', $ids));

        return " AND `{$dealTableAlias}`.`id` IN ({$idsPlaceholder})";
    }

    private function filterBySearchTerm(string $searchTerm): array
    {
        if (empty($searchTerm)) {
            return [null, []];
        }

        $searchTerm = strtolower($searchTerm);

        $dealTableAlias = self::DEAL_TABLE_ALIAS;

        $filter = " 
        AND ({$dealTableAlias}.name LIKE '%%%s%%' 
        OR {$dealTableAlias}.email LIKE '%%%s%%' 
        OR {$dealTableAlias}.description LIKE '%%%s%%')";

        $bindings = [Connection::esc_like("{$searchTerm}"), Connection::esc_like("{$searchTerm}"), Connection::esc_like("{$searchTerm}")];

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

    private function totalData(string $query, array $bindings): int
    {
        $countQuery = 'SELECT COUNT(*) as total FROM (' . $query . ') as temp_table';

        try {
            $result = Deal::raw($countQuery, $bindings);

            return $result[0]->total ?? 0;
        } catch (Throwable $th) {
            return 0;
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
        $wpUsersTable = Config::get('WP_DB_PREFIX') . 'users';
        $ownerTableAlias = self::OWNER_TABLE_ALIAS;
        $dealTableAlias = self::DEAL_TABLE_ALIAS;

        return " LEFT JOIN {$wpUsersTable} {$ownerTableAlias} ON {$dealTableAlias}.owner_id = {$ownerTableAlias}.ID AND {$dealTableAlias}.owner_id IS NOT NULL AND {$dealTableAlias}.owner_id <> '' ";
    }

    private function getOwnerNameSelect(): string
    {
        $ownerTableAlias = self::OWNER_TABLE_ALIAS;

        return ", {$ownerTableAlias}.display_name AS owner_name";
    }

    private function validateArguments(array $args): bool
    {
        return Arr::has($args, ['perPage', 'offset', 'sortBy', 'sortOrder', 'searchTerm', 'tags', 'advancedFilterGroups']);
    }
}
