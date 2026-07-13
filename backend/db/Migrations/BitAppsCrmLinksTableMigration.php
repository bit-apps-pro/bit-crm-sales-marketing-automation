<?php

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPDatabase\Blueprint;
use BitApps\Crm\Deps\BitApps\WPDatabase\Connection;
use BitApps\Crm\Deps\BitApps\WPDatabase\Schema;
use BitApps\Crm\Deps\BitApps\WPKit\Migration\Migration;

if (!defined('ABSPATH')) {
    exit;
}

final class BitAppsCrmLinksTableMigration extends Migration
{
    public function up(): void
    {
        Schema::withPrefix(Connection::wpPrefix() . Config::VAR_PREFIX)->create(
            'links',
            function (Blueprint $table): void {
                $table->id();
                $table->string('title');
                $table->longtext('description')->nullable();
                $table->string('link');
                $table->bigint('entity_id');
                $table->string('module');
                $table->bigint('created_by')->nullable();
                $table->bigint('updated_by')->nullable();
                $table->longtext('attributes')->nullable();
                $table->timestamps();
            }
        );
    }

    public function down(): void
    {
        Schema::withPrefix(Connection::wpPrefix() . Config::VAR_PREFIX)->drop('links');
    }
}
