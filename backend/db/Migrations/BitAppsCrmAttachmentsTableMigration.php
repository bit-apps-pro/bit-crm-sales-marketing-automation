<?php

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPDatabase\Blueprint;
use BitApps\Crm\Deps\BitApps\WPDatabase\Connection;
use BitApps\Crm\Deps\BitApps\WPDatabase\Schema;
use BitApps\Crm\Deps\BitApps\WPKit\Migration\Migration;

if (!defined('ABSPATH')) {
    exit;
}

final class BitAppsCrmAttachmentsTableMigration extends Migration
{
    public function up(): void
    {
        Schema::withPrefix(Connection::wpPrefix() . Config::VAR_PREFIX)->create(
            'attachments',
            function (Blueprint $table): void {
                $table->id();
                $table->string('file_name');
                $table->string('media_id');
                $table->string('media_url');
                $table->string('mime');
                $table->string('file_size_in_bytes');
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
        Schema::withPrefix(Connection::wpPrefix() . Config::VAR_PREFIX)->drop('attachments');
    }
}
