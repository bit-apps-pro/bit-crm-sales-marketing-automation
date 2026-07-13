<?php

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPDatabase\Blueprint;
use BitApps\Crm\Deps\BitApps\WPDatabase\Connection;
use BitApps\Crm\Deps\BitApps\WPDatabase\Schema;
use BitApps\Crm\Deps\BitApps\WPKit\Migration\Migration;

if (!defined('ABSPATH')) {
    exit;
}

final class BitAppsCrmLeadsTableMigration extends Migration
{
    public function up(): void
    {
        Schema::withPrefix(Connection::wpPrefix() . Config::VAR_PREFIX)->create(
            'leads',
            function (Blueprint $table): void {
                $table->id();
                $table->string('title')->nullable();
                $table->string('last_name');
                $table->string('first_name')->nullable();
                $table->string('email')->nullable();
                $table->string('phone')->nullable();
                $table->string('website')->nullable();
                $table->string('company_name')->nullable();
                $table->string('lead_source')->nullable();
                $table->string('lead_status')->nullable();
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
                $table->string('industry')->nullable();
                $table->string('currency')->nullable();
                $table->float('annual_revenue')->nullable();
                $table->longtext('description')->nullable();
                $table->boolean('status')->defaultValue(1);
                $table->boolean('is_converted')->defaultValue(0);
                $table->longtext('conversion_details')->nullable();
                $table->boolean('is_trash')->defaultValue(0);
                $table->bigint('owner_id')->unsigned()->nullable();
                $table->binary('reference_uuid', 16);
                $table->bigint('import_id')->unsigned()->nullable();
                $table->bigint('created_by')->nullable();
                $table->bigint('updated_by')->nullable();
                $table->timestamps();
            }
        );
    }

    public function down(): void
    {
        Schema::withPrefix(Connection::wpPrefix() . Config::VAR_PREFIX)->drop('leads');
    }
}
