<?php

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPDatabase\Blueprint;
use BitApps\Crm\Deps\BitApps\WPDatabase\Connection;
use BitApps\Crm\Deps\BitApps\WPDatabase\Schema;
use BitApps\Crm\Deps\BitApps\WPKit\Migration\Migration;

if (!defined('ABSPATH')) {
    exit;
}

final class BitAppsCrmImapSettingsTableMigration extends Migration
{
    public function up(): void
    {
        Schema::withPrefix(Connection::wpPrefix() . Config::VAR_PREFIX)->create(
            'imap_settings',
            function (Blueprint $table): void {
                $table->id();
                $table->string('title');
                $table->bigint('created_by')->nullable();
                $table->bigint('updated_by')->nullable();
                $table->string('platform');
                $table->string('username');
                $table->string('app_password');
                $table->string('host');
                $table->string('port');
                $table->string('encryption');
                $table->string('visibility');
                $table->boolean('status')->defaultValue(1);
                $table->timestamps();
            }
        );
    }

    public function down(): void
    {
        Schema::withPrefix(Connection::wpPrefix() . Config::VAR_PREFIX)->drop('imap_settings');
    }
}
