<?php

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPDatabase\Blueprint;
use BitApps\Crm\Deps\BitApps\WPDatabase\Connection;
use BitApps\Crm\Deps\BitApps\WPDatabase\Schema;
use BitApps\Crm\Deps\BitApps\WPKit\Migration\Migration;

if (!defined('ABSPATH')) {
    exit;
}

final class BitAppsCrmCompaniesTableMigration extends Migration
{
    public function up(): void
    {
        Schema::withPrefix(Connection::wpPrefix() . Config::VAR_PREFIX)->create(
            'companies',
            function (Blueprint $table): void {
                $table->id();
                $table->bigint('owner_id')->unsigned()->nullable();
                $table->bigint('parent_id')->unsigned()->nullable();
                $table->string('name');
                $table->string('phone')->nullable();
                $table->string('website')->nullable();
                $table->string('fax')->nullable();
                $table->string('company_number')->nullable();
                $table->string('ticker_symbol')->nullable();
                $table->integer('employees_number')->nullable();
                $table->string('industry')->nullable();
                $table->string('currency')->nullable();
                $table->string('annual_revenue')->nullable();
                $table->string('type')->nullable();
                $table->string('rating')->nullable();
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
                $table->longtext('description')->nullable();
                $table->boolean('status')->defaultValue(1);
                $table->binary('reference_uuid', 16)->nullable();
                $table->boolean('is_trash')->defaultValue(0);
                $table->bigint('created_by')->nullable();
                $table->bigint('updated_by')->nullable();
                $table->bigint('import_id')->unsigned()->nullable();
                $table->timestamps();
            }
        );
    }

    public function down(): void
    {
        Schema::withPrefix(Connection::wpPrefix() . Config::VAR_PREFIX)->drop('companies');
    }
}
