<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Config;
use BitApps\Crm\Deps\Mpdf\HTMLParserMode as MpdfHTMLParserMode;
use BitApps\Crm\Deps\Mpdf\Mpdf;
use BitApps\Crm\Model\Invoice;
use BitApps\Crm\Model\LineItem;
use BitApps\Crm\Model\Setting;
use BitApps\Crm\src\InvoicePdfTemplate\InvoiceData;
use BitApps\Crm\src\InvoicePdfTemplate\InvoicePdfTemplate;
use BitApps\Crm\src\InvoicePdfTemplate\InvoiceTotals;
use Exception;

class InvoicePdfService
{
    private InvoiceTermService $invoiceTermService;

    private CurrencyService $currencyService;

    public function __construct(
        ?InvoiceTermService $invoiceTermService = null,
        ?CurrencyService $currencyService = null
    ) {
        $this->invoiceTermService = $invoiceTermService ?? new InvoiceTermService();
        $this->currencyService = $currencyService ?? new CurrencyService();
    }

    public function generate(int $invoiceId): Mpdf
    {
        $data = $this->fetchData($invoiceId);
        $totals = $this->calculateTotals($data->invoice, $data->lineItems);

        return $this->createPdf($data, $totals);
    }

    private function fetchData(int $invoiceId): InvoiceData
    {
        $details = InvoiceService::getInvoiceDetails($invoiceId);

        if ($details === null) {
            throw new Exception(esc_html__('Invoice, Deal, or Contact not found.', 'bit-crm-sales-marketing-automation'));
        }

        $terms = $this->invoiceTermService->getAllTerms();
        $termName = $terms[$details['invoice']->term_key]['name'] ?? 'Custom';

        $settings = Setting::findOne(['setting_key' => Setting::BUSINESS_SETTINGS_KEY]);
        $businessSettings = !empty($settings) ? ($settings->setting_value ?? []) : [];

        return new InvoiceData(
            $details['invoice'],
            $details['deal'],
            $details['contact'],
            $details['line_items'],
            $termName,
            $details['currency_data'],
            $businessSettings
        );
    }

    private function calculateTotals(Invoice $invoice, array $lineItems): InvoiceTotals
    {
        $subtotal = 0.0;
        $totalTax = 0.0;
        $isExclusive = $invoice->tax_option === LineItem::TAX_EXCLUSIVE;
        $isInclusive = $invoice->tax_option === LineItem::TAX_INCLUSIVE;

        foreach ($lineItems as $item) {
            $unitPrice = (float) ($item['unit_price_in_deal_currency'] ?? 0);
            $quantity = (float) ($item['quantity'] ?? 0);
            $discountPercentage = (float) ($item['discount_percentage'] ?? 0);
            $taxRate = (float) ($item['tax_rate'] ?? 0);

            $afterDiscount = $unitPrice * $quantity * (1 - $discountPercentage / 100);

            if ($isExclusive) {
                $subtotal += $afterDiscount;
                $totalTax += $afterDiscount * ($taxRate / 100);
            } elseif ($isInclusive) {
                $priceWithoutTax = $afterDiscount / (1 + $taxRate / 100);
                $subtotal += $priceWithoutTax;
                $totalTax += $afterDiscount - $priceWithoutTax;
            } else {
                $subtotal += $afterDiscount;
            }
        }

        $discount = $this->calculateGrossDiscount($invoice, $subtotal, $totalTax);
        $grandTotal = $subtotal + $totalTax - $discount;

        return new InvoiceTotals(
            $subtotal,
            $totalTax,
            $grandTotal,
            $discount,
            $isExclusive,
            $isInclusive
        );
    }

    private function calculateGrossDiscount(Invoice $invoice, float $subtotal, float $totalTax): float
    {
        $grossDiscountAmount = (float) ($invoice->gross_discount_amount ?? 0);

        if ($grossDiscountAmount <= 0) {
            return 0.0;
        }

        if (($invoice->gross_discount_type ?? '') === 'rate') {
            return ($subtotal + $totalTax) * ($grossDiscountAmount / 100);
        }

        return $grossDiscountAmount;
    }

    private function getDefaultPdfConfig(): array
    {
        return [
            'format'        => 'A4',
            'margin_top'    => 20,
            'margin_bottom' => 20,
            'margin_left'   => 10,
            'margin_right'  => 10,
            'default_font'  => 'dejavusans'
        ];
    }

    private function createPdf(InvoiceData $data, InvoiceTotals $totals): Mpdf
    {
        $pdfConfig = $this->getDefaultPdfConfig();
        $mpdf = new Mpdf($pdfConfig);

        $template = new InvoicePdfTemplate($data, $totals, $this->currencyService);

        $html = $template->render();

        $cssPath = Config::get('BASEDIR') . '/resources/invoice/template-1.css';
        if (!file_exists($cssPath)) {
            throw new Exception(esc_html__('Invoice CSS template not found.', 'bit-crm-sales-marketing-automation'));
        }

        $styleSheet = file_get_contents($cssPath);
        if ($styleSheet === false) {
            throw new Exception(esc_html__('Failed to read invoice CSS template.', 'bit-crm-sales-marketing-automation'));
        }

        $mpdf->WriteHTML('<style>' . $styleSheet . '</style>', MpdfHTMLParserMode::HEADER_CSS);
        $mpdf->WriteHTML($html, MpdfHTMLParserMode::HTML_BODY);

        return $mpdf;
    }
}
