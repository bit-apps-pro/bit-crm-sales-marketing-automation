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

    public function __construct(
        Invoice $invoice,
        Deal $deal,
        Contact $contact,
        array $lineItems,
        string $termName,
        array $currencyData,
        array $businessSettings
    ) {
        $this->invoice = $invoice;
        $this->deal = $deal;
        $this->contact = $contact;
        $this->lineItems = $lineItems;
        $this->termName = $termName;
        $this->currencyData = $currencyData;
        $this->businessSettings = $businessSettings;
    }
}
