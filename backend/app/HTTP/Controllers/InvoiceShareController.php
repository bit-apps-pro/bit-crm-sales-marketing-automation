<?php

namespace BitApps\Crm\HTTP\Controllers;

use BitApps\Crm\Constants\HookKeys;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Deps\BitApps\WPKit\Http\Response;
use BitApps\Crm\HTTP\Requests\InvoiceShare\PublicShowRequest;
use BitApps\Crm\HTTP\Requests\InvoiceShare\ShareLinkRequest;
use BitApps\Crm\Model\Invoice;
use BitApps\Crm\Model\LineItem;
use BitApps\Crm\Model\Setting;
use BitApps\Crm\Services\BusinessSettingService;
use BitApps\Crm\Services\InvoicePdfService;
use BitApps\Crm\Services\InvoiceService;
use BitApps\Crm\Services\InvoiceShareTokenService;
use BitApps\Crm\Services\InvoiceTermService;
use BitApps\Crm\Utils\Logger;
use Throwable;

/**
 * Invoice sharing — a FREE feature: the admin Share Link action and the
 * token-guarded public view/download endpoints behind the shareable page.
 *
 * Paying a shared invoice is a PRO feature. The public payload therefore
 * always carries the "payment unavailable" defaults here (regardless of what
 * the database rows say — the payment columns are shared schema and must not
 * enable the feature by themselves); the pro plugin replaces the block with
 * live payment data through HookKeys::PUBLIC_INVOICE_PAYMENT_DATA.
 */
final class InvoiceShareController
{
    private const DEFAULT_CURRENCY_DECIMALS = 2;

    public function shareLink(ShareLinkRequest $request)
    {
        $validated = $request->validated();

        $invoice = Invoice::findOne(['id' => $validated['id']]);

        if (empty($invoice) || $invoice->is_trash) {
            return Response::error(__('Invoice not found!', 'bit-crm-sales-marketing-automation'));
        }

        try {
            $published = InvoiceService::publishInvoice($invoice);

            return Response::success([
                'url'       => (new InvoiceShareTokenService())->getPublicInvoiceUrl($invoice),
                'published' => $published,
            ]);
        } catch (Throwable $th) {
            Logger::error($th);

            return Response::error(__('Failed to generate share link!', 'bit-crm-sales-marketing-automation'));
        }
    }

    /**
     * Public, token-guarded invoice payload. Mirrors the shape of the admin /
     * client-portal invoice details so portal components can render it as-is.
     */
    public function publicShow(PublicShowRequest $request)
    {
        $validated = $request->validated();

        $invoice = $this->resolvePublicInvoice($validated);

        if ($invoice === null) {
            return Response::error(__('Invoice not found!', 'bit-crm-sales-marketing-automation'), 404);
        }

        $details = InvoiceService::getInvoiceDetails((int) $invoice->id);

        if ($details === null) {
            return Response::error(__('Invoice not found!', 'bit-crm-sales-marketing-automation'), 404);
        }

        $settings = Setting::findOne(['setting_key' => BusinessSettingService::SETTING_KEY]);
        $terms = (new InvoiceTermService())->getAllTerms();

        $paymentData = Hooks::applyFilter(
            HookKeys::PUBLIC_INVOICE_PAYMENT_DATA,
            $this->unavailablePaymentData($invoice, $details),
            $invoice,
            $details
        );

        $invoiceData = $this->publicInvoiceData($details['invoice']);
        // Keep the nested field consistent with the (possibly forced) block —
        // without pro the raw column must never surface as enabled.
        $invoiceData['partial_payment_allowed'] = (bool) ($paymentData['partial_payment_allowed'] ?? false);

        return Response::success(array_merge(
            [
                'term_name'         => $terms[$details['invoice']->term_key]['name'] ?? __('Custom', 'bit-crm-sales-marketing-automation'),
                'invoice'           => $invoiceData,
                'deal'              => $this->publicDealData($details['deal']),
                'contact'           => $this->publicContactData($details['contact']),
                'line_items'        => $details['line_items'],
                'currency_data'     => $details['currency_data'],
                'business_settings' => !empty($settings) ? ($settings->setting_value ?? []) : [],
            ],
            $paymentData
        ));
    }

    /**
     * Public, token-guarded PDF download — same document the admin
     * download/send actions produce.
     */
    public function publicDownload(PublicShowRequest $request)
    {
        $validated = $request->validated();

        $invoice = $this->resolvePublicInvoice($validated);

        if ($invoice === null) {
            return Response::error(__('Invoice not found!', 'bit-crm-sales-marketing-automation'), 404);
        }

        try {
            $mpdf = (new InvoicePdfService())->generate((int) $invoice->id);
            $fileName = InvoiceService::generateInvoiceFileName($invoice->invoice_prefix, (int) $invoice->id);
            $mpdf->Output($fileName, 'D');

            exit;
        } catch (Throwable $th) {
            Logger::error($th);

            return Response::error(__('Failed to generate invoice PDF!', 'bit-crm-sales-marketing-automation'));
        }
    }

    /**
     * Payment block of the public payload without the pro plugin: online
     * payment is unavailable, no history, no partial settings — the totals
     * summary is still real so the page can show total/due.
     */
    private function unavailablePaymentData(Invoice $invoice, array $details): array
    {
        return [
            'payments'                => [],
            'payment_summary'         => $this->fallbackPaymentSummary($invoice, $details),
            'partial_payment_allowed' => false,
            'minimum_payment_type'    => Invoice::MINIMUM_PAYMENT_TYPE_AMOUNT,
            'minimum_payment_value'   => 0,
            'is_payable'              => \in_array($invoice->status, Invoice::PAYABLE_STATUSES, true),
            'is_woo_active'           => class_exists('WooCommerce'),
            'woo_payment'             => [
                'available'    => false,
                'woo_currency' => null,
            ],
        ];
    }

    /**
     * Totals-only summary (no payment history exists without pro). Shape
     * mirrors the pro InvoicePaymentService::getPaymentSummary().
     */
    private function fallbackPaymentSummary(Invoice $invoice, array $details): ?array
    {
        try {
            $decimalsRaw = $details['currency_data']['decimal_places'] ?? self::DEFAULT_CURRENCY_DECIMALS;
            $decimals = is_numeric($decimalsRaw)
                ? max(0, min(LineItem::MONETARY_PRECISION, (int) $decimalsRaw))
                : self::DEFAULT_CURRENCY_DECIMALS;

            $totals = (new InvoicePdfService())->calculateTotals($invoice, $details['line_items']);
            $total = round($totals->grandTotal, $decimals);
            $paid = $invoice->status === Invoice::STATUS_PAID ? $total : 0.0;

            return [
                'total'                  => $total,
                'paid'                   => $paid,
                'due'                    => max(0.0, round($total - $paid, $decimals)),
                'minimum_payment_amount' => 0,
                'currency'               => (string) ($details['currency_data']['currency'] ?? ''),
                'decimal_places'         => $decimals,
            ];
        } catch (Throwable $th) {
            Logger::error($th);

            return null;
        }
    }

    private function resolvePublicInvoice(array $validated): ?Invoice
    {
        $invoice = Invoice::findOne(['id' => $validated['id']]);

        if (
            empty($invoice)
            || $invoice->is_trash
            || !(new InvoiceShareTokenService())->isValidToken($invoice, $validated['token'] ?? '')
        ) {
            return null;
        }

        return $invoice;
    }

    /**
     * Only the invoice fields the public page renders — never the share
     * token, WP user ids (created_by/updated_by) or other audit columns.
     *
     * @param mixed $invoice
     */
    private function publicInvoiceData($invoice): array
    {
        $fields = [
            'id',
            'entity_id',
            'module',
            'invoice_prefix',
            'invoice_date',
            'due_date',
            'status',
            'tax_option',
            'gross_discount_amount',
            'gross_discount_type',
            'top_section_notes',
            'bottom_section_notes',
            'term_key',
            'partial_payment_allowed',
            'sent_at',
            'paid_at',
        ];

        $data = [];

        foreach ($fields as $field) {
            $data[$field] = $invoice->{$field} ?? null;
        }

        return $data;
    }

    /**
     * Only the deal fields the invoice itself displays — matches the client
     * portal's DealInformation shape without leaking internal deal data.
     *
     * @param mixed $deal
     */
    private function publicDealData($deal): array
    {
        return [
            'id'         => $deal->id ?? null,
            'name'       => $deal->name ?? null,
            'email'      => $deal->email ?? null,
            'contact_id' => $deal->contact_id ?? null,
            'currency'   => $deal->currency ?? null,
        ];
    }

    /**
     * Only the contact fields the invoice itself displays — the public payload
     * must never leak the full CRM contact record.
     *
     * @param mixed $contact
     */
    private function publicContactData($contact): array
    {
        $fields = [
            'id',
            'title',
            'first_name',
            'last_name',
            'email',
            'phone',
            'billing_address_line_1',
            'billing_address_line_2',
            'billing_city',
            'billing_county',
            'billing_state',
            'billing_zip',
            'billing_country',
        ];

        $data = [];

        foreach ($fields as $field) {
            $data[$field] = $contact->{$field} ?? null;
        }

        return $data;
    }
}
