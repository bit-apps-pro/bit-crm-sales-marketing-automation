<?php

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPDatabase\Blueprint;
use BitApps\Crm\Deps\BitApps\WPDatabase\Connection;
use BitApps\Crm\Deps\BitApps\WPDatabase\Schema;
use BitApps\Crm\Deps\BitApps\WPKit\Migration\Migration;

if (!defined('ABSPATH')) {
    exit;
}

final class BitAppsCrmEmailsTableMigration extends Migration
{
    public function up(): void
    {
        Schema::withPrefix(Connection::wpPrefix() . Config::VAR_PREFIX)->create(
            'emails',
            function (Blueprint $table): void {
                $table->id();
                $table->bigint('email_uid')->unsigned()->nullable();
                $table->string('message_id');
                $table->string('entity_email');
                $table->datetime('email_date');
                $table->text('subject')->nullable();
                $table->longtext('body')->nullable();
                $table->string('email_direction');
                $table->bigint('imap_id')->unsigned()->nullable();
                $table->string('sent_from')->nullable();
                $table->longtext('attachments')->nullable();
                $table->bigint('created_by')->unsigned()->nullable();
                $table->bigint('updated_by')->unsigned()->nullable();
                $table->timestamps();
            }
        );
    }

    public function down(): void
    {
        Schema::withPrefix(Connection::wpPrefix() . Config::VAR_PREFIX)->drop('emails');
    }
}
