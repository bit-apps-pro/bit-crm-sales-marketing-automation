<?php

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPDatabase\Blueprint;
use BitApps\Crm\Deps\BitApps\WPDatabase\Connection;
use BitApps\Crm\Deps\BitApps\WPDatabase\Schema;
use BitApps\Crm\Deps\BitApps\WPKit\Migration\Migration;

if (!defined('ABSPATH')) {
    exit;
}

final class BitAppsCrmImportExportListTableMigration extends Migration
{
    public function up(): void
    {
        Schema::withPrefix(Connection::wpPrefix() . Config::VAR_PREFIX)->create(
            'import_export_lists',
            function (Blueprint $table): void {
                $table->id();
                $table->string('type');
                $table->string('process_id');
                $table->string('module');
                $table->integer('total')->defaultValue(0);
                $table->integer('completed')->defaultValue(0);
                $table->integer('updated')->nullable()->defaultValue(0);
                $table->integer('skipped')->nullable()->defaultValue(0);
                $table->text('file_name')->nullable();
                $table->text('file_path');
                $table->string('status');
                $table->bigint('created_by')->nullable();
                $table->bigint('updated_by')->nullable();
                $table->timestamps();
            }
        );
    }

    public function down(): void
    {
        Schema::withPrefix(Connection::wpPrefix() . Config::VAR_PREFIX)->drop('import_export_lists');
    }
}
