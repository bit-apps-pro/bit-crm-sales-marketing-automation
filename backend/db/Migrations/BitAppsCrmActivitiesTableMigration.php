<?php

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPDatabase\Blueprint;
use BitApps\Crm\Deps\BitApps\WPDatabase\Connection;
use BitApps\Crm\Deps\BitApps\WPDatabase\Schema;
use BitApps\Crm\Deps\BitApps\WPKit\Migration\Migration;

if (!defined('ABSPATH')) {
    exit;
}

final class BitAppsCrmActivitiesTableMigration extends Migration
{
    public function up(): void
    {
        Schema::withPrefix(Connection::wpPrefix() . Config::VAR_PREFIX)->create(
            'activities',
            function (Blueprint $table): void {
                $table->id();
                $table->string('title');
                $table->string('type');
                $table->string('priority')->nullable();
                $table->datetime('due_date')->nullable();
                $table->longtext('details')->nullable();
                $table->longtext('attachments')->nullable();
                $table->bool('is_completed')->defaultValue(0);
                $table->bigint('entity_id');
                $table->string('module');
                $table->bigint('assigned_to')->nullable();
                $table->bigint('created_by')->nullable();
                $table->bigint('updated_by')->nullable();
                $table->longtext('attributes')->nullable();
                $table->timestamps();
            }
        );
    }

    public function down(): void
    {
        Schema::withPrefix(Connection::wpPrefix() . Config::VAR_PREFIX)->drop('activities');
    }
}
