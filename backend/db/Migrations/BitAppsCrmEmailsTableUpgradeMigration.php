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
 * Adds the header columns (from_email, to_emails, cc, bcc) to the emails table
 * on installs created before them. Fresh installs get the columns from the
 * base emails CREATE, so this is a no-op there.
 *
 * Before these columns the sender and recipient were inferred from
 * entity_email plus email_direction, which is wrong for any mail where the
 * entity was only copied: the entity showed up as "To" and the real recipient
 * was lost. New rows store the real headers; old rows stay NULL and the UI
 * falls back to the old inference for them.
 *
 * Same shape as BitAppsCrmInvoicesTableUpgradeMigration: a db_version guard
 * decides WHETHER the upgrade is owed, and every step inside is driven by the
 * live schema so a repeated run cannot double-add a column.
 *
 * ORDERING: sorts after BitAppsCrmEmailsTableMigration (the table must exist;
 * it also checks) and before BitAppsCrmPluginOptions, which stamps the new
 * db_version at the end of the run.
 *
 * All columns are nullable with no backfill: NULL means "header not recorded",
 * which is exactly what every pre-existing row is.
 */
final class BitAppsCrmEmailsTableUpgradeMigration extends Migration
{
    /**
     * The db_version that first ships these columns.
     */
    private const TARGET_DB_VERSION = '1.0.3';

    // column => Blueprint method that creates it; every one is nullable.
    private const COLUMNS = [
        'from_email' => 'string',
        'to_emails'  => 'longtext',
        'cc'         => 'longtext',
        'bcc'        => 'longtext',
    ];

    public function up(): void
    {
        $installedDbVersion = Config::getOption('db_version');

        // No stamp at all means a fresh install: the base CREATE already has
        // the columns.
        if (!$installedDbVersion || version_compare($installedDbVersion, self::TARGET_DB_VERSION, '>=')) {
            return;
        }

        /*
         * Never let a schema problem take the site down: migrations run from
         * Plugin::loaded() and MigrationHelper calls up() without a try/catch,
         * so an escaping exception is a fatal on every admin request. The
         * columns are nullable and additive, so an install that misses them
         * keeps working as before; the logged error is the signal to look.
         */
        try {
            $table = Config::withDBPrefix('emails');

            if (!$this->tableExists($table)) {
                return; // the base emails migration has not created it yet
            }

            $missing = array_filter(
                self::COLUMNS,
                fn (string $column): bool => !$this->hasColumn($table, $column),
                ARRAY_FILTER_USE_KEY
            );

            if (empty($missing)) {
                return;
            }

            Schema::withPrefix(Connection::wpPrefix() . Config::VAR_PREFIX)->edit(
                'emails',
                function (Blueprint $blueprint) use ($missing): void {
                    foreach ($missing as $column => $type) {
                        $blueprint->{$type}($column)->nullable();
                    }
                }
            );
        } catch (Throwable $th) {
            Logger::error($th);
        }
    }

    public function down(): void
    {
        // Columns live on the emails table; its own migration drops it.
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
