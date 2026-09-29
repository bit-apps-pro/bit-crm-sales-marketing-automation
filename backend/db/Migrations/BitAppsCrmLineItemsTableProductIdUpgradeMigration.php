<?php

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPDatabase\Connection;
use BitApps\Crm\Deps\BitApps\WPKit\Migration\Migration;
use BitApps\Crm\Utils\Logger;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Widens line_items.product_id from BIGINT to VARCHAR. Every source shipped
 * before SureCart keys its catalogue on an integer, but a SureCart purchasable
 * is a Price UUID, which a BIGINT stores as 0. Widening is lossless: 123
 * becomes "123". Fresh installs get VARCHAR from the base CREATE.
 *
 * ORDERING: sorts after BitAppsCrmLineItemsTableMigration (the table must
 * exist; it also checks) and before BitAppsCrmPluginOptions, which stamps the
 * new db_version at the end of the run.
 */
final class BitAppsCrmLineItemsTableProductIdUpgradeMigration extends Migration
{
    /** The db_version that first ships the widened column. */
    private const TARGET_DB_VERSION = '1.0.5';

    private const COLUMN_DEFINITION = 'VARCHAR(255) NULL DEFAULT NULL';

    public function up(): void
    {
        $installedDbVersion = Config::getOption('db_version');

        // No stamp at all means a fresh install: the base CREATE is already
        // VARCHAR.
        if (!$installedDbVersion || version_compare($installedDbVersion, self::TARGET_DB_VERSION, '>=')) {
            return;
        }

        // MigrationHelper calls up() without a try/catch, so an escaping
        // exception is a fatal on every admin request.
        try {
            $table = Config::withDBPrefix('line_items');

            if (!$this->tableExists($table)) {
                return; // the base line_items migration has not created it yet
            }

            if ($this->columnIsString($table, 'product_id')) {
                return; // already widened by an earlier run
            }

            Connection::query(
                "ALTER TABLE `{$table}` MODIFY COLUMN `product_id` " . self::COLUMN_DEFINITION
            );
        } catch (Throwable $th) {
            Logger::error($th);
        }
    }

    public function down(): void
    {
        // The column lives on the line_items table; its own migration drops it.
    }

    private function tableExists(string $table): bool
    {
        return (bool) Connection::get_var(Connection::prepare(
            'SELECT COUNT(1) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = %s',
            $table
        ));
    }

    private function columnIsString(string $table, string $column): bool
    {
        $dataType = Connection::get_var(Connection::prepare(
            'SELECT DATA_TYPE FROM information_schema.columns
             WHERE table_schema = DATABASE() AND table_name = %s AND column_name = %s',
            $table,
            $column
        ));

        return is_string($dataType) && strtolower($dataType) === 'varchar';
    }
}
