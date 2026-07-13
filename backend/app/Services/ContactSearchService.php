<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Config;
use BitApps\Crm\Constants\HookKeys;
use BitApps\Crm\Deps\BitApps\WPDatabase\Connection;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Model\Contact;
use BitApps\Crm\Traits\FormatPagination;
use Exception;
use Throwable;

class ContactSearchService
{
    use FormatPagination;

    public const CONTACT_TABLE_ALIAS = 'contacts';

    public const COMPANY_TABLE_ALIAS = 'companies';

    public const OWNER_TABLE_ALIAS = 'users';

    public const MODULE = Contact::MODULE_NAME;

    public function search(array $args)
    {
        if (!$this->validateArguments($args)) {
            throw new Exception(esc_html__('Invalid arguments.', 'bit-crm'));
        }

        $contactTable = Config::withDBPrefix('contacts');
        $contactTableAlias = self::CONTACT_TABLE_ALIAS;
        $customFieldsSelect = Hooks::applyFilter(HookKeys::CUSTOM_FIELDS_COLUMNS, '', self::MODULE);
        $customFieldsJoin = Hooks::applyFilter(HookKeys::CUSTOM_FIELDS_JOIN, '', self::MODULE);
        $companyTableJoin = $this->getCompanyTableJoin();
        $companyNameSelect = $this->getCompanyNameSelect();
        $ownerTableJoin = $this->getOwnerTableJoin();
        $ownerNameSelect = $this->getOwnerNameSelect();
        $parentNameSelect = $this->getParentNameSelect();
        $select = "SELECT {$contactTableAlias}.*" . $companyNameSelect . $ownerNameSelect . $parentNameSelect . ($customFieldsSelect ? ', ' . $customFieldsSelect : '');

        $baseQuery = "
        {$select}
        FROM {$contactTable} {$contactTableAlias}
        {$customFieldsJoin}
        {$companyTableJoin}
        {$ownerTableJoin}
        WHERE {$contactTableAlias}.is_trash = 0";

        [$advancedFilters, $advancedFiltersBindings] = $this->advancedFilters($args['advancedFilterGroups'] ?? []);
        $baseQuery .= $this->filterByTags($args['tags']);
        $baseQuery .= $this->filterByIds($args['ids'] ?? []);
        [$searchFilter, $searchBindings] = $this->filterBySearchTerm($args['searchTerm']);
        $baseQuery .= $searchFilter;
        $baseQuery .= " GROUP BY {$contactTableAlias}.id {$advancedFilters}";

        $countQuery = $baseQuery;

        $baseQuery .= " ORDER BY `{$args['sortBy']}` {$args['sortOrder']} LIMIT {$args['perPage']} OFFSET {$args['offset']}";
        $bindings = array_merge($searchBindings, $advancedFiltersBindings);

        try {
            $data = Contact::raw($baseQuery, $bindings) ?? [];
        } catch (Throwable $th) {
            throw new Exception(esc_html__('Failed to fetch contacts.', 'bit-crm'));
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
        $contactTableAlias = self::CONTACT_TABLE_ALIAS;

        return " 
            AND `{$contactTableAlias}`.`id` IN (
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

        $contactTableAlias = self::CONTACT_TABLE_ALIAS;
        $contactIdsPlaceholder = implode(',', array_map('intval', $ids));

        return " AND `{$contactTableAlias}`.`id` IN ({$contactIdsPlaceholder})";
    }

    private function filterBySearchTerm(string $searchTerm): array
    {
        if (empty($searchTerm)) {
            return [null, []];
        }

        $searchTerm = strtolower($searchTerm);

        $contactTableAlias = self::CONTACT_TABLE_ALIAS;

        $filter = " 
        AND ({$contactTableAlias}.first_name LIKE '%%%s%%' 
        OR {$contactTableAlias}.last_name LIKE '%%%s%%' 
        OR {$contactTableAlias}.email LIKE '%%%s%%')";

        $bindings = [Connection::esc_like("{$searchTerm}"), Connection::esc_like("{$searchTerm}"), Connection::esc_like("{$searchTerm}")];

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
            $result = Contact::raw($countQuery, $bindings);

            return $result[0]->total ?? 0;
        } catch (Throwable $th) {
            return 0;
        }
    }

    private function getCompanyTableJoin(): string
    {
        $companyTable = Config::withDBPrefix('companies');
        $companyTableAlias = self::COMPANY_TABLE_ALIAS;
        $contactTableAlias = self::CONTACT_TABLE_ALIAS;

        return " LEFT JOIN {$companyTable} {$companyTableAlias} ON {$contactTableAlias}.company_id = {$companyTableAlias}.id AND {$companyTableAlias}.is_trash = 0 AND {$contactTableAlias}.company_id IS NOT NULL AND {$contactTableAlias}.company_id <> '' ";
    }

    private function getCompanyNameSelect(): string
    {
        $companyTableAlias = self::COMPANY_TABLE_ALIAS;

        return ", {$companyTableAlias}.name AS company_name";
    }

    private function getOwnerTableJoin(): string
    {
        $wpUsersTable = Config::get('WP_DB_PREFIX') . 'users';
        $ownerTableAlias = self::OWNER_TABLE_ALIAS;
        $contactTableAlias = self::CONTACT_TABLE_ALIAS;

        return " LEFT JOIN {$wpUsersTable} {$ownerTableAlias} ON {$contactTableAlias}.owner_id = {$ownerTableAlias}.ID AND {$contactTableAlias}.owner_id IS NOT NULL AND {$contactTableAlias}.owner_id <> '' ";
    }

    private function getOwnerNameSelect(): string
    {
        $ownerTableAlias = self::OWNER_TABLE_ALIAS;

        return ", {$ownerTableAlias}.display_name AS owner_name";
    }

    private function getParentNameSelect(): string
    {
        $contactTable = Config::withDBPrefix('contacts');
        $contactTableAlias = self::CONTACT_TABLE_ALIAS;

        return ", (
            SELECT CONCAT_WS(' ', parent.first_name, parent.last_name)
            FROM {$contactTable} AS parent
            WHERE parent.id = {$contactTableAlias}.parent_id
            AND parent.is_trash = 0
            LIMIT 1
        ) AS parent_name";
    }

    private function validateArguments(array $args): bool
    {
        $requiredKeys = ['perPage', 'offset', 'page', 'sortBy', 'sortOrder', 'searchTerm', 'filters', 'tags'];

        foreach ($requiredKeys as $key) {
            if (!\array_key_exists($key, $args)) {
                return false;
            }
        }

        return true;
    }
}
