<?php

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPDatabase\Blueprint;
use BitApps\Crm\Deps\BitApps\WPDatabase\Connection;
use BitApps\Crm\Deps\BitApps\WPDatabase\Schema;
use BitApps\Crm\Deps\BitApps\WPKit\Migration\Migration;

if (!defined('ABSPATH')) {
    exit;
}

final class BitAppsCrmLineItemsTableUpdateMigration extends Migration
{
    /**
     * DB version that changed discount_percentage & tax_rate from BIGINT to DECIMAL(8, 4).
     */
    private const TARGET_DB_VERSION = '1.0.1';

    public function up(): void
    {
        $installedDbVersion = Config::getOption('db_version');

        // No stored db_version means a fresh install: this migration runs before
        // BitAppsCrmPluginOptions stamps it, and the table was just created with
        // the final schema, so there is nothing to upgrade.
        if (!$installedDbVersion || version_compare($installedDbVersion, self::TARGET_DB_VERSION, '>=')) {
            return;
        }

        Schema::withPrefix(Connection::wpPrefix() . Config::VAR_PREFIX)->edit(
            'line_items',
            function (Blueprint $table): void {
                $table->decimal('discount_percentage', 8, 4)->defaultValue(0)->change();
                $table->decimal('tax_rate', 8, 4)->defaultValue(0)->change();
            }
        );
    }

    public function down(): void
    {
        // Columns are removed with the table by BitAppsCrmLineItemsTableMigration::down().
    }
}
