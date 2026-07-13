<?php

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPDatabase\Blueprint;
use BitApps\Crm\Deps\BitApps\WPDatabase\Connection;
use BitApps\Crm\Deps\BitApps\WPDatabase\Schema;
use BitApps\Crm\Deps\BitApps\WPKit\Migration\Migration;

if (!defined('ABSPATH')) {
    exit;
}

final class BitAppsCrmDealsTableMigration extends Migration
{
    public function up(): void
    {
        Schema::withPrefix(Connection::wpPrefix() . Config::VAR_PREFIX)->create(
            'deals',
            function (Blueprint $table): void {
                $table->id();
                $table->string('name');
                $table->bigint('company_id')->unsigned()->nullable();
                $table->bigint('contact_id')->unsigned();
                $table->bigint('owner_id')->unsigned()->nullable();
                $table->string('email')->nullable();
                $table->string('type')->nullable();
                $table->string('lead_source')->nullable();
                $table->string('amount')->nullable()->defaultValue('0');
                $table->string('home_currency_amount')->nullable();
                $table->string('currency')->nullable();
                $table->string('tax_option')->defaultValue('exclusive');
                $table->string('gross_discount_amount')->nullable()->defaultValue('0');
                $table->string('gross_discount_type')->nullable()->defaultValue('amount');
                $table->string('stage');
                $table->float('probability')->nullable();
                $table->string('description')->nullable();
                $table->boolean('status')->defaultValue(1);
                $table->binary('reference_uuid', 16);
                $table->bigint('import_id')->unsigned()->nullable();
                $table->boolean('is_trash')->defaultValue(0);
                $table->bigint('created_by')->unsigned()->nullable();
                $table->bigint('updated_by')->unsigned()->nullable();
                $table->datetime('closed_at')->nullable();
                $table->timestamps();
            }
        );
    }

    public function down(): void
    {
        Schema::withPrefix(Connection::wpPrefix() . Config::VAR_PREFIX)->drop('deals');
    }
}
