<?php

namespace BitApps\Crm\src\InvoicePdfTemplate;

use BitApps\Crm\Services\CurrencyService;

class InvoicePdfTemplate
{
    private InvoiceData $data;

    private InvoiceTotals $totals;

    private CurrencyService $currencyService;

    public function __construct(
        InvoiceData $data,
        InvoiceTotals $totals,
        CurrencyService $currencyService
    ) {
        $this->data = $data;
        $this->totals = $totals;
        $this->currencyService = $currencyService;
    }

    public function render(): string
    {
        return $this->buildInvoiceHeader()
            . $this->buildSenderReceiverSection()
            . $this->buildTopNotes()
            . $this->buildLineItemsTable()
            . $this->buildSummaryTable()
            . $this->buildBottomNotes();
    }

    private function escape(string $str): string
    {
        return htmlspecialchars($str, ENT_QUOTES | ENT_HTML5);
    }

    private function escapeWithBreak(string $str): string
    {
        return $this->escape($str) . '<br/>';
    }

    private function formatCurrency(float $amount, bool $withSymbol = true): string
    {
        return $this->currencyService->currencyFormatPreview($this->data->currencyData, $amount, $withSymbol);
    }

    private function cityStateZip(array $parts): string
    {
        $filtered = array_filter(array_map(fn ($v) => $this->escape((string) $v), $parts));

        return $filtered ? implode(', ', $filtered) . '<br/>' : '';
    }

    private function buildAddressLines(array $fields): string
    {
        $html = '';
        foreach ($fields as $value) {
            if (!empty($value)) {
                $html .= $this->escapeWithBreak((string) $value);
            }
        }

        return $html;
    }

    private function buildInvoiceHeader(): string
    {
        $logoHtml = !empty($this->data->businessSettings['logo_url'])
            ? '<img src="' . esc_url($this->data->businessSettings['logo_url']) . '" style="max-width: 192px; width: auto; max-height: 128px;" alt="business logo" />'
            : '';

        $dateFormat = get_option('date_format');
        $invoice = $this->data->invoice;
        $invoiceDate = !empty($invoice->invoice_date) ? date_i18n($dateFormat, strtotime($invoice->invoice_date)) : '';
        $dueDate = !empty($invoice->due_date) ? date_i18n($dateFormat, strtotime($invoice->due_date)) : '';
        $invoiceNumber = !empty($invoice->invoice_prefix)
            ? $invoice->invoice_prefix . '-' . $invoice->id
            : (string) $invoice->id;

        return '<table class="no-border" style="margin-bottom: 20px;">
            <tr>
                <td class="half-width no-border" style="padding: 0;">' . $logoHtml . '</td>
                <td class="half-width no-border text-right" style="padding: 0;">
                    <h1>INVOICE</h1>
                    <table class="no-border" style="width: 100%;">
                        <tr>
                            <td class="no-border text-right"><strong>Invoice Number: </strong></td>
                            <td class="no-border text-right">' . $this->escape($invoiceNumber) . '</td>
                        </tr>
                        <tr>
                            <td class="no-border text-right"><strong>Date: </strong></td>
                            <td class="no-border text-right">' . $this->escape($invoiceDate) . '</td>
                        </tr>
                        <tr>
                            <td class="no-border text-right"><strong>Due Date: </strong></td>
                            <td class="no-border text-right">' . $this->escape($dueDate) . '</td>
                        </tr>
                        <tr>
                            <td class="no-border text-right"><strong>Terms: </strong></td>
                            <td class="no-border text-right">' . $this->escape($this->data->termName) . '</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>';
    }

    private function buildTopNotes(): string
    {
        if (empty($this->data->invoice->top_section_notes)) {
            return '';
        }

        $html = '';
        foreach ($this->data->invoice->top_section_notes as $note) {
            if (trim($note['value']) !== '') {
                $html .= '<p><strong>' . $this->escape($note['label']) . '</strong></p>';
                $html .= wp_kses_post($note['value']);
            }
        }

        return $html;
    }

    private function buildBusinessInfo(): string
    {
        $s = $this->data->businessSettings;

        $html = !empty($s['name']) ? '<strong>' . $this->escape($s['name']) . '</strong><br/>' : '';

        $html .= $this->buildAddressLines(
            [
                $s['email'] ?? '',
                $s['phone_number'] ?? '',
                $s['mobile_number'] ?? '',
                $s['street'] ?? '',
            ]
        );

        $html .= $this->cityStateZip([$s['city'] ?? '', $s['state'] ?? '', $s['postal_code'] ?? '']);

        if (!empty($s['country'])) {
            $html .= $this->escapeWithBreak($s['country']);
        }

        return $html ?: 'Business information not configured';
    }

    private function buildContactInfo(): string
    {
        $contact = $this->data->contact;

        $html = '<strong>'
            . '<span style="text-transform: capitalize;">' . $this->escape($contact->title ?? '') . '</span> '
            . $this->escape($contact->first_name ?? '') . ' '
            . $this->escape($contact->last_name ?? '')
            . '</strong><br/>';

        $html .= $this->buildAddressLines(
            [
                $contact->phone ?? '',
                $this->data->deal->email ?? '',
                $contact->billing_address_line_1 ?? '',
                $contact->billing_address_line_2 ?? '',
            ]
        );

        $html .= $this->cityStateZip([$contact->billing_city ?? '', $contact->billing_state ?? '', $contact->billing_zip ?? '']);

        if (!empty($contact->billing_country)) {
            $html .= $this->escapeWithBreak($contact->billing_country);
        }

        return $html;
    }

    private function buildSenderReceiverSection(): string
    {
        return '<table class="no-border" style="margin-bottom: 30px;">
            <tr>
                <td class="half-width no-border">
                    <h3>From</h3>
                    <br/>
                    <p>' . $this->buildBusinessInfo() . '</p>
                </td>
                <td class="half-width no-border">
                    <h3>Bill To</h3>
                    <br/>
                    <p>' . $this->buildContactInfo() . '</p>
                </td>
            </tr>
        </table>';
    }

    private function buildLineItemsTable(): string
    {
        $symbol = $this->escape($this->data->currencyData['currency'] ?? $this->data->currencyData['symbol']);
        $hasTax = $this->totals->hasTax();

        $html = '<table class="items-table">
            <thead>
                <tr style="background-color: #FAFAFB;">
                    <th width="40%" style="padding: 10px">Product Name</th>
                    <th class="text-right" style="padding: 10px;">Price (' . $symbol . ')</th>
                    <th class="text-right" style="padding: 10px;">Qty</th>
                    <th class="text-right" style="padding: 10px;">Discount (%)</th>'
                    . ($hasTax ? '<th class="text-right" style="padding: 10px;">Tax (%)</th>' : '')
                    . '<th class="text-right" style="padding: 10px;">Total (' . $symbol . ')</th>
                </tr>
            </thead>
            <tbody>';

        foreach ($this->data->lineItems as $lineItem) {
            $unitPrice = (float) ($lineItem['unit_price_in_deal_currency'] ?? 0);
            $quantity = (float) ($lineItem['quantity'] ?? 0);
            $discountPercentage = (float) ($lineItem['discount_percentage'] ?? 0);
            $taxRate = (float) ($lineItem['tax_rate'] ?? 0);

            $afterDiscount = $unitPrice * $quantity * (1 - $discountPercentage / 100);
            $lineTotal = $this->totals->isExclusive ? $afterDiscount * (1 + $taxRate / 100) : $afterDiscount;

            $qtyFormatted = $quantity === floor($quantity)
                ? number_format((int) $quantity)
                : number_format($quantity, 2);

            $html .= '<tr>
                <td>
                    <strong>' . $this->escape($lineItem['product_name']) . '</strong>'
                    . (!empty($lineItem['description']) ? '<p class="description">' . $this->escape($lineItem['description']) . '</p>' : '')
                    . '</td>
                <td style="text-align: right;">' . $this->formatCurrency($unitPrice, false) . '</td>
                <td style="text-align: right;">' . $qtyFormatted . '</td>
                <td style="text-align: right;">' . $this->escape((string) $discountPercentage) . '</td>'
                . ($hasTax ? '<td style="text-align: right;">' . $this->escape((string) $taxRate) . '</td>' : '')
                . '<td style="text-align: right;">' . $this->formatCurrency($lineTotal, false) . '</td>
            </tr>';
        }

        return $html . '</tbody></table>';
    }

    private function buildSummaryTable(): string
    {
        $html = '<table class="summary-table">
            <tr>
                <td>Subtotal:</td>
                <td class="text-right">' . $this->formatCurrency($this->totals->subtotal) . '</td>
            </tr>';

        if ($this->totals->hasTax()) {
            $html .= '<tr>
                <td>Tax (' . $this->escape($this->totals->taxLabel()) . '):</td>
                <td class="text-right">' . $this->formatCurrency($this->totals->totalTax) . '</td>
            </tr>';
        }

        if ($this->totals->discount > 0) {
            $grossDiscountAmount = (float) ($this->data->invoice->gross_discount_amount ?? 0);
            $discountLabel = ($this->data->invoice->gross_discount_type ?? '') === 'rate'
                ? 'Gross Discount (' . $grossDiscountAmount . '%):'
                : 'Gross Discount:';

            $html .= '<tr>
                <td>' . $this->escape($discountLabel) . '</td>
                <td class="text-right">' . $this->formatCurrency($this->totals->discount) . '</td>
            </tr>';
        }

        $html .= '<tr class="total-row">
                <td><strong>Grand Total:</strong></td>
                <td class="text-right"><strong>' . $this->formatCurrency($this->totals->grandTotal) . '</strong></td>
            </tr>
        </table>';

        return $html;
    }

    private function buildBottomNotes(): string
    {
        if (empty($this->data->invoice->bottom_section_notes)) {
            return '';
        }

        $html = '<div style="margin-top: 30px;">';
        foreach ($this->data->invoice->bottom_section_notes as $note) {
            if (trim($note['value']) !== '') {
                $html .= '<p><strong>' . $this->escape($note['label']) . '</strong></p>';
                $html .= wp_kses_post($note['value']);
            }
        }

        return $html . '</div>';
    }
}
