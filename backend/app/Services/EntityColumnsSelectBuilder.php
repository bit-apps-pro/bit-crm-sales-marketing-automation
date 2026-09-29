<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Deps\BitApps\WPDatabase\Connection;

/**
 * Builds the base table part of a list search SELECT.
 *
 * Custom field values are selected under their field_key, so a key equal to a real
 * table column (a custom "Description" field is keyed `description`) selects that name
 * twice. MySQL accepts that in a plain SELECT but rejects it inside the COUNT(*) derived
 * table, which silently zeroed the pagination total. The custom column comes last and
 * already wins in each row, so the colliding table column is left out.
 */
class EntityColumnsSelectBuilder
{
    public function buildSelect(string $table, string $alias, array $customFieldKeys): string
    {
        $allColumnsSelect = "{$alias}.*";

        if (empty($customFieldKeys)) {
            return $allColumnsSelect;
        }

        $columns = $this->getTableColumns($table);
        $keptColumns = array_diff($columns, $customFieldKeys);

        if (empty($columns) || \count($keptColumns) === \count($columns)) {
            return $allColumnsSelect;
        }

        return implode(', ', array_map(fn ($column) => "{$alias}.`{$column}`", $keptColumns));
    }

    private function getTableColumns(string $table): array
    {
        static $cache = [];

        if (!isset($cache[$table])) {
            $cache[$table] = Connection::get_col("SHOW COLUMNS FROM `{$table}`") ?: [];
        }

        return $cache[$table];
    }
}
