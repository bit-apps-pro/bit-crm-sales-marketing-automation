<?php

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPDatabase\Blueprint;
use BitApps\Crm\Deps\BitApps\WPDatabase\Connection;
use BitApps\Crm\Deps\BitApps\WPDatabase\Schema;
use BitApps\Crm\Deps\BitApps\WPKit\Migration\Migration;
use BitApps\Crm\Utils\Logger;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Adds companies.tax_id (the company's VAT or tax number) to installs created before the tax module.
 * Fresh installs get the column from the base CREATE; existing rows stay NULL.
 *
 * ORDERING: sorts after BitAppsCrmCompaniesTableMigration and before BitAppsCrmPluginOptions, which
 * stamps the new db_version at the end of the run.
 */
final class BitAppsCrmCompaniesTableTaxIdUpgradeMigration extends Migration
{
    private const TARGET_DB_VERSION = '1.0.6';

    public function up(): void
    {
        $installedDbVersion = Config::getOption('db_version');

        // No stamp at all means a fresh install: the base CREATE already has the column.
        if (!$installedDbVersion || version_compare($installedDbVersion, self::TARGET_DB_VERSION, '>=')) {
            return;
        }

        // MigrationHelper calls up() without a try/catch, so an escaping exception is a fatal on every admin request.
        try {
            $table = Config::withDBPrefix('companies');

            if (!$this->tableExists($table) || $this->hasColumn($table, 'tax_id')) {
                return;
            }

            Schema::withPrefix(Connection::wpPrefix() . Config::VAR_PREFIX)->edit(
                'companies',
                function (Blueprint $blueprint): void {
                    $blueprint->string('tax_id')->nullable();
                }
            );
        } catch (Throwable $th) {
            Logger::error($th);
        }
    }

    public function down(): void
    {
        // The column lives on the companies table; its own migration drops it.
    }

    private function tableExists(string $table): bool
    {
        return (bool) Connection::get_var(
            Connection::prepare(
                'SELECT COUNT(1) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = %s',
                $table
            )
        );
    }

    private function hasColumn(string $table, string $column): bool
    {
        return (bool) Connection::get_var(
            Connection::prepare(
                'SELECT COUNT(1) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = %s AND column_name = %s',
                $table,
                $column
            )
        );
    }
}
