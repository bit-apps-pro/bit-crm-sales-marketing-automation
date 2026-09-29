<?php

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPDatabase\Blueprint;
use BitApps\Crm\Deps\BitApps\WPDatabase\Connection;
use BitApps\Crm\Deps\BitApps\WPDatabase\Schema;
use BitApps\Crm\Deps\BitApps\WPKit\Migration\Migration;
use BitApps\Crm\Model\InvoicePayment;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Invoice payment ledger — provider-agnostic by design.
 *
 * The CRM-owned truth (amount/currency in the invoice's own currency, status,
 * paid_at) lives in real columns. WHAT collected the money is the
 * (provider, provider_ref) identity pair — 'manual' + a locally minted ref
 * for an offline settlement recorded by hand, 'woocommerce' + order id for a
 * checkout, FluentCart / SureCart refs later (VARCHAR: SureCart uses UUIDs).
 * The pair's uniqueness is enforced in the services (every event handler
 * looks a row up by provider + provider_ref and checks its status before
 * writing, and new rows always carry a freshly created ref), not by a DB
 * constraint. All provider-flavored settlement details (charged
 * amount/currency in the provider's checkout currency, refunded total,
 * locked fx rate) live in the provider_data JSON column, so adding a
 * provider never adds columns.
 *
 * This table lives in FREE so the records outlive the pro plugin — see
 * InvoicePayment. It previously shipped in pro, so existing pro installs
 * already have it; creation is therefore guarded on the table's absence
 * rather than assumed, and an install that already has rows is left exactly
 * as it is.
 */
final class BitAppsCrmInvoicePaymentsTableMigration extends Migration
{
    public function up(): void
    {
        Schema::withPrefix(Connection::wpPrefix() . Config::VAR_PREFIX)->create(
            'invoice_payments',
            function (Blueprint $table): void {
                $table->id();
                $table->bigint('entity_id')->unsigned();
                $table->string('module');
                $table->string('provider');
                $table->string('provider_ref');
                $table->string('amount')->defaultValue('0');
                $table->string('currency')->nullable();
                $table->longtext('provider_data')->nullable();
                $table->string('status')->defaultValue(InvoicePayment::STATUS_PENDING);
                $table->datetime('paid_at')->nullable();
                $table->bigint('created_by')->nullable();
                $table->timestamps();
            }
        );
    }

    public function down(): void
    {
        Schema::withPrefix(Connection::wpPrefix() . Config::VAR_PREFIX)->drop('invoice_payments');
    }
}
