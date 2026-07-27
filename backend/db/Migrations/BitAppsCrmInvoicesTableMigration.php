<?php

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPDatabase\Blueprint;
use BitApps\Crm\Deps\BitApps\WPDatabase\Connection;
use BitApps\Crm\Deps\BitApps\WPDatabase\Schema;
use BitApps\Crm\Deps\BitApps\WPKit\Migration\Migration;

if (!defined('ABSPATH')) {
    exit;
}

final class BitAppsCrmInvoicesTableMigration extends Migration
{
    public function up(): void
    {
        Schema::withPrefix(Connection::wpPrefix() . Config::VAR_PREFIX)->create(
            'invoices',
            function (Blueprint $table): void {
                $table->id();
                $table->datetime('invoice_date');
                $table->datetime('due_date');
                $table->string('invoice_prefix');
                $table->string('term_key')->defaultValue('custom');
                $table->string('status')->defaultValue('draft');
                $table->bigint('entity_id')->unsigned();
                $table->string('module');
                $table->datetime('paid_at')->nullable();
                $table->string('tax_option')->defaultValue('exclusive');
                $table->datetime('sent_at')->nullable();
                $table->boolean('is_trash')->defaultValue(0);
                $table->string('gross_discount_amount')->nullable()->defaultValue('0');
                $table->string('gross_discount_type')->nullable()->defaultValue('amount');
                $table->longtext('top_section_notes')->nullable();
                $table->longtext('bottom_section_notes')->nullable();
                $table->string('amount')->nullable()->defaultValue('0');
                $table->string('home_currency_amount')->nullable();
                $table->string('currency')->nullable();
                $table->bigint('created_by')->nullable();
                $table->bigint('updated_by')->nullable();
                $table->timestamps();
            }
        );
    }

    public function down(): void
    {
        Schema::withPrefix(Connection::wpPrefix() . Config::VAR_PREFIX)->drop('invoices');
    }
}
