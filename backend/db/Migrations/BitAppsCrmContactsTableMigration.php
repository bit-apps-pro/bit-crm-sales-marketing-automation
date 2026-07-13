<?php

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPDatabase\Blueprint;
use BitApps\Crm\Deps\BitApps\WPDatabase\Connection;
use BitApps\Crm\Deps\BitApps\WPDatabase\Schema;
use BitApps\Crm\Deps\BitApps\WPKit\Migration\Migration;

if (!defined('ABSPATH')) {
    exit;
}

final class BitAppsCrmContactsTableMigration extends Migration
{
    public function up(): void
    {
        Schema::withPrefix(Connection::wpPrefix() . Config::VAR_PREFIX)->create(
            'contacts',
            function (Blueprint $table): void {
                $table->id();
                $table->bigint('owner_id')->unsigned()->nullable();
                $table->bigint('company_id')->unsigned()->nullable();
                $table->bigint('parent_id')->unsigned()->nullable();
                $table->string('title')->nullable();
                $table->string('last_name');
                $table->string('first_name')->nullable();
                $table->string('email')->nullable();
                $table->string('phone')->nullable();
                $table->string('mobile')->nullable();
                $table->string('fax')->nullable();
                $table->string('department')->nullable();
                $table->string('assistant')->nullable();
                $table->string('assistant_phone')->nullable();
                $table->string('lead_source')->nullable();
                $table->date('date_of_birth')->nullable();
                $table->string('secondary_email')->nullable();
                $table->text('billing_address_line_1')->nullable();
                $table->text('billing_address_line_2')->nullable();
                $table->string('billing_city')->nullable();
                $table->string('billing_county')->nullable();
                $table->string('billing_state')->nullable();
                $table->string('billing_zip')->nullable();
                $table->string('billing_country')->nullable();
                $table->text('shipping_address_line_1')->nullable();
                $table->text('shipping_address_line_2')->nullable();
                $table->string('shipping_city')->nullable();
                $table->string('shipping_county')->nullable();
                $table->string('shipping_state')->nullable();
                $table->string('shipping_zip')->nullable();
                $table->string('shipping_country')->nullable();
                $table->string('currency')->nullable();
                $table->longtext('description')->nullable();
                $table->boolean('status')->defaultValue(1);
                $table->boolean('is_trash')->defaultValue(0);
                $table->binary('reference_uuid', 16);
                $table->bigint('import_id')->unsigned()->nullable();
                $table->bigint('created_by')->nullable();
                $table->bigint('updated_by')->nullable();
                $table->string('created_from')->nullable();
                $table->timestamps();
            }
        );
    }

    public function down(): void
    {
        Schema::withPrefix(Connection::wpPrefix() . Config::VAR_PREFIX)->drop('contacts');
    }
}
