<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Deps\BitApps\WPDatabase\Connection;
use BitApps\Crm\Deps\BitApps\WPKit\Helpers\Arr;

class AdvancedFilterService
{
    private const FILTER_OPERATORS = [
        'date' => [
            'equals', 'greater_than', 'less_than', 'greater_than_equal',
            'less_than_equal', 'between', 'not_between', 'is_empty', 'is_not_empty',
        ],
        'email' => [
            'contains', 'equals', 'is_empty', 'is_not_empty',
        ],
        'multi-select' => [
            'contains', 'not_contains', 'is_empty', 'is_not_empty',
        ],
        'number' => [
            'equals', 'greater_than', 'less_than', 'greater_than_equal',
            'less_than_equal', 'is_empty', 'is_not_empty',
        ],
        'select' => [
            'equals', 'not_equals', 'is_empty', 'is_not_empty',
        ],
        'text' => [
            'contains', 'equals', 'starts_with', 'ends_with', 'is_empty', 'is_not_empty',
        ]
    ];

    private const FILTER_OPERATORS_WITHOUT_VALUE = ['is_empty', 'is_not_empty'];

    /**
     * Column identifiers a filter is allowed to reference, keyed for lookup.
     *
     * Holds the module's real columns plus its registered custom fields. Filter
     * conditions are concatenated into a raw query as bare identifiers, so a key
     * outside this list must never reach the SQL.
     *
     * @var array<string, int>
     */
    private $allowedFieldKeys;

    public function __construct(array $allowedFieldKeys = [])
    {
        $this->allowedFieldKeys = array_flip($allowedFieldKeys);
    }

    /**
     * Apply advanced filters to the query.
     *
     * @param array $advancedFilters The advanced filter array structure
     *
     * @return array [filterQuery, bindings]
     */
    public function applyAdvancedFilters(array $advancedFilters): array
    {
        if (empty($advancedFilters)) {
            return [null, []];
        }

        $orGroups = [];
        $bindings = [];

        // Each top-level array represents an OR group
        foreach ($advancedFilters as $orGroup) {
            if (!\is_array($orGroup) || empty($orGroup)) {
                continue;
            }

            $andConditions = [];

            // Each item in the OR group represents an AND condition
            foreach ($orGroup as $filter) {
                if (!$this->isValidFilter($filter)) {
                    continue;
                }

                [$condition, $filterBindings] = $this->buildFilterCondition($filter);

                if ($condition) {
                    $andConditions[] = $condition;
                    $bindings = array_merge($bindings, $filterBindings);
                }
            }

            if (!empty($andConditions)) {
                $orGroups[] = '(' . implode(' AND ', $andConditions) . ')';
            }
        }

        if (empty($orGroups)) {
            return [null, []];
        }

        $filterQuery = ' HAVING ' . implode(' OR ', $orGroups);

        return [$filterQuery, $bindings];
    }

    /**
     * Build the filter condition.
     *
     * @param array $filter - The filter to build the condition for
     *
     * @return array [condition, bindings]
     */
    private function buildFilterCondition(array $filter): array
    {
        $fieldKey = $this->mapFieldKey($filter['field_key']);
        $operator = $filter['operator'];
        $value = $filter['value'] ?? null;
        $fieldType = $filter['field_type'];

        if (!isset($this->allowedFieldKeys[$fieldKey])) {
            return [null, []];
        }

        if (!$this->isValidOperator($fieldType, $operator)) {
            return [null, []];
        }

        $columnName = "`{$fieldKey}`";

        return $this->buildConditionByOperator($columnName, $operator, $value, $fieldType);
    }

    /**
     * Build the condition by operator.
     *
     * @param string $columnName - The column name
     * @param string $operator - The operator
     * @param mixed $value - The value
     * @param string $fieldType - The field type
     *
     * @return array [condition, bindings]
     */
    private function buildConditionByOperator(string $columnName, string $operator, $value, string $fieldType): array
    {
        switch ($operator) {
            case 'equals':
                return $this->buildEqualsCondition($columnName, $value);

            case 'not_equals':
                return $this->buildNotEqualsCondition($columnName, $value);

            case 'contains':
                return $this->buildContainsCondition($columnName, $value, $fieldType);

            case 'not_contains':
                return $this->buildNotContainsCondition($columnName, $value, $fieldType);

            case 'starts_with':
                return $this->buildStartsWithCondition($columnName, $value);

            case 'ends_with':
                return $this->buildEndsWithCondition($columnName, $value);

            case 'greater_than':
                return $this->buildGreaterThanCondition($columnName, $value);

            case 'less_than':
                return $this->buildLessThanCondition($columnName, $value);

            case 'greater_than_equal':
                return $this->buildGreaterThanEqualCondition($columnName, $value);

            case 'less_than_equal':
                return $this->buildLessThanEqualCondition($columnName, $value);

            case 'between':
                return $this->buildBetweenCondition($columnName, $value);

            case 'not_between':
                return $this->buildNotBetweenCondition($columnName, $value);

            case 'is_empty':
                return $this->buildIsEmptyCondition($columnName);

            case 'is_not_empty':
                return $this->buildIsNotEmptyCondition($columnName);

            default:
                return [null, []];
        }
    }

    /**
     * Build the equals condition.
     *
     * @param string $columnName - The column name
     * @param mixed $value - The value
     *
     * @return array [condition, bindings]
     */
    private function buildEqualsCondition(string $columnName, $value): array
    {
        if (\is_array($value)) {
            $placeholders = str_repeat('%s,', \count($value));
            $placeholders = rtrim($placeholders, ',');

            return ["{$columnName} IN ({$placeholders})", array_values($value)];
        }

        return ["{$columnName} = %s", [$value]];
    }

    /**
     * Build the not equals condition.
     *
     * @param string $columnName - The column name
     * @param mixed $value - The value
     *
     * @return array [condition, bindings]
     */
    private function buildNotEqualsCondition(string $columnName, $value): array
    {
        if (\is_array($value)) {
            $placeholders = str_repeat('%s,', \count($value));
            $placeholders = rtrim($placeholders, ',');

            return ["{$columnName} NOT IN ({$placeholders})", array_values($value)];
        }

        return ["{$columnName} != %s", [$value]];
    }

    /**
     * Build the contains condition.
     *
     * @param string $columnName - The column name
     * @param mixed $value - The value
     * @param string $fieldType - The field type
     *
     * @return array [condition, bindings]
     */
    private function buildContainsCondition(string $columnName, $value, string $fieldType): array
    {
        if (\in_array($fieldType, ['multi-select', 'checkbox']) && \is_array($value)) {
            $conditions = [];
            $bindings = [];

            foreach ($value as $item) {
                $conditions[] = "{$columnName} LIKE %s";
                $bindings[] = '%' . Connection::esc_like($item) . '%';
            }

            return ['(' . implode(' OR ', $conditions) . ')', $bindings];
        }

        $searchValue = \is_array($value) ? implode(' ', $value) : $value;

        return ["{$columnName} LIKE %s", ['%' . Connection::esc_like($searchValue) . '%']];
    }

    /**
     * Build the not contains condition.
     *
     * @param string $columnName - The column name
     * @param mixed $value - The value
     * @param string $fieldType - The field type
     *
     * @return array [condition, bindings]
     */
    private function buildNotContainsCondition(string $columnName, $value, string $fieldType): array
    {
        if (\in_array($fieldType, ['multi-select', 'checkbox']) && \is_array($value)) {
            $conditions = [];
            $bindings = [];

            foreach ($value as $item) {
                $conditions[] = "{$columnName} NOT LIKE %s";
                $bindings[] = '%' . Connection::esc_like($item) . '%';
            }

            return ['(' . implode(' AND ', $conditions) . ')', $bindings];
        }

        $searchValue = \is_array($value) ? implode(' ', $value) : $value;

        return ["{$columnName} NOT LIKE %s", ['%' . Connection::esc_like($searchValue) . '%']];
    }

    /**
     * Build the starts with condition.
     *
     * @param string $columnName - The column name
     * @param mixed $value - The value
     *
     * @return array [condition, bindings]
     */
    private function buildStartsWithCondition(string $columnName, $value): array
    {
        return ["{$columnName} LIKE %s", [Connection::esc_like($value) . '%']];
    }

    /**
     * Build the ends with condition.
     *
     * @param string $columnName - The column name
     * @param mixed $value - The value
     *
     * @return array [condition, bindings]
     */
    private function buildEndsWithCondition(string $columnName, $value): array
    {
        return ["{$columnName} LIKE %s", ['%' . Connection::esc_like("{$value}")]];
    }

    /**
     * Build the greater than condition.
     *
     * @param string $columnName - The column name
     * @param mixed $value - The value
     *
     * @return array [condition, bindings]
     */
    private function buildGreaterThanCondition(string $columnName, $value): array
    {
        return ["{$columnName} > %s", [$value]];
    }

    /**
     * Build the less than condition.
     *
     * @param string $columnName - The column name
     * @param mixed $value - The value
     *
     * @return array [condition, bindings]
     */
    private function buildLessThanCondition(string $columnName, $value): array
    {
        return ["{$columnName} < %s", [$value]];
    }

    /**
     * Build the greater than equal condition.
     *
     * @param string $columnName - The column name
     * @param mixed $value - The value
     *
     * @return array [condition, bindings]
     */
    private function buildGreaterThanEqualCondition(string $columnName, $value): array
    {
        return ["{$columnName} >= %s", [$value]];
    }

    /**
     * Build the less than equal condition.
     *
     * @param string $columnName - The column name
     * @param mixed $value - The value
     *
     * @return array [condition, bindings]
     */
    private function buildLessThanEqualCondition(string $columnName, $value): array
    {
        return ["{$columnName} <= %s", [$value]];
    }

    /**
     * Build the between condition.
     *
     * @param string $columnName - The column name
     * @param mixed $value - The value
     *
     * @return array [condition, bindings]
     */
    private function buildBetweenCondition(string $columnName, $value): array
    {
        if (!\is_array($value) || \count($value) !== 2) {
            return [null, []];
        }

        return ["{$columnName} BETWEEN %s AND %s", [$value[0], $value[1]]];
    }

    /**
     * Build the not between condition.
     *
     * @param string $columnName - The column name
     * @param mixed $value - The value
     *
     * @return array [condition, bindings]
     */
    private function buildNotBetweenCondition(string $columnName, $value): array
    {
        if (!\is_array($value) || \count($value) !== 2) {
            return [null, []];
        }

        return ["{$columnName} NOT BETWEEN %s AND %s", [$value[0], $value[1]]];
    }

    /**
     * Build the is empty condition.
     *
     * @param string $columnName - The column name
     *
     * @return array [condition, bindings]
     */
    private function buildIsEmptyCondition(string $columnName): array
    {
        return ["({$columnName} IS NULL OR {$columnName} = '')", []];
    }

    /**
     * Build the is not empty condition.
     *
     * @param string $columnName - The column name
     *
     * @return array [condition, bindings]
     */
    private function buildIsNotEmptyCondition(string $columnName): array
    {
        return ["({$columnName} IS NOT NULL AND {$columnName} != '')", []];
    }

    /**
     * Validate the filter structure.
     *
     * @param array $filter - The filter to validate
     *
     * @return bool - True if valid, false otherwise
     */
    private function isValidFilter(array $filter): bool
    {
        if (isset($filter['operator']) && \in_array($filter['operator'], self::FILTER_OPERATORS_WITHOUT_VALUE)) {
            $requiredKeys = ['field_key', 'operator', 'field_type'];
        } else {
            $requiredKeys = ['field_key', 'operator', 'value', 'field_type'];
        }

        return Arr::has($filter, $requiredKeys);
    }

    /**
     * Validate if the operator is valid for the given field type.
     *
     * @param string $fieldType - The field type
     * @param string $operator - The operator to validate
     *
     * @return bool - True if valid, false otherwise
     */
    private function isValidOperator(string $fieldType, string $operator): bool
    {
        return isset(self::FILTER_OPERATORS[$fieldType])
               && \in_array($operator, self::FILTER_OPERATORS[$fieldType]);
    }

    /**
     * Resolves a submitted field key to the column the query can filter on.
     *
     * Modules that only expose a company through a joined select alias filter by
     * the foreign key instead. A module owning a real column of that name (leads
     * store the company as plain text) keeps its own column.
     */
    private function mapFieldKey(string $fieldKey): string
    {
        if (isset($this->allowedFieldKeys[$fieldKey])) {
            return $fieldKey;
        }

        $mapping = [
            'company_name' => 'company_id',
        ];

        return $mapping[$fieldKey] ?? $fieldKey;
    }
}
