<?php

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPDatabase\Blueprint;
use BitApps\Crm\Deps\BitApps\WPDatabase\Connection;
use BitApps\Crm\Deps\BitApps\WPDatabase\Schema;
use BitApps\Crm\Deps\BitApps\WPKit\Migration\Migration;

if (!defined('ABSPATH')) {
    exit;
}

final class BitAppsCrmLineItemsTableMigration extends Migration
{
    public function up(): void
    {
        Schema::withPrefix(Connection::wpPrefix() . Config::VAR_PREFIX)->create(
            'line_items',
            function (Blueprint $table): void {
                $table->id();
                $table->bigint('entity_id')->unsigned();
                $table->string('module');
                $table->bigint('product_id')->unsigned()->nullable();
                $table->string('product_name')->nullable();
                $table->string('product_code')->nullable();
                $table->string('product_source')->nullable();
                $table->bigint('quantity')->defaultValue(1);
                $table->decimal('discount_percentage', 8, 4)->defaultValue(0);
                $table->decimal('tax_rate', 8, 4)->defaultValue(0);
                $table->string('unit_price_in_home_currency')->nullable();
                $table->string('unit_price_in_deal_currency')->nullable();
                $table->string('total_price_in_home_currency')->nullable();
                $table->string('total_price_in_deal_currency')->nullable();
                $table->string('description')->nullable();
                $table->bigint('created_by')->unsigned()->nullable();
                $table->bigint('updated_by')->unsigned()->nullable();
                $table->timestamps();
            }
        );
    }

    public function down(): void
    {
        Schema::withPrefix(Connection::wpPrefix() . Config::VAR_PREFIX)->drop('line_items');
    }
}
