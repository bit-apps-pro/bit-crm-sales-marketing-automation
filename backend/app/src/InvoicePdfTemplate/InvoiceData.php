<?php

namespace BitApps\Crm\src\InvoicePdfTemplate;

use BitApps\Crm\Model\Contact;
use BitApps\Crm\Model\Deal;
use BitApps\Crm\Model\Invoice;

final class InvoiceData
{
    public Invoice $invoice;

    public Deal $deal;

    public Contact $contact;

    public array $lineItems;

    public string $termName;

    public array $currencyData;

    public array $businessSettings;

    /**
     * Optional heading overrides for documents that reuse this layout (pro
     * quotes): title, number, due_date, and hide_terms to drop the Terms
     * row. Missing keys keep the invoice wording.
     */
    public array $labels;

    public function __construct(
        Invoice $invoice,
        Deal $deal,
        Contact $contact,
        array $lineItems,
        string $termName,
        array $currencyData,
        array $businessSettings,
        array $labels = []
    ) {
        $this->invoice = $invoice;
        $this->deal = $deal;
        $this->contact = $contact;
        $this->lineItems = $lineItems;
        $this->termName = $termName;
        $this->currencyData = $currencyData;
        $this->businessSettings = $businessSettings;
        $this->labels = $labels;
    }
}
