<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPDatabase\Model;
use BitApps\Crm\Deps\BitApps\WPDatabase\QueryBuilder;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Helpers\File;
use BitApps\Crm\Helpers\FileHandler;
use BitApps\Crm\Model\Contact;
use BitApps\Crm\Model\Deal;
use BitApps\Crm\Model\Invoice;
use BitApps\Crm\Model\LineItem;
use BitApps\Crm\src\Queue\MarkOverdueInvoicesProcess;
use BitApps\Crm\src\StaticData\CurrencyHelper;
use BitApps\Crm\Utils\Logger;
use Throwable;

class InvoiceService
{
    private const TEMP_DIR = '/bit_crm/temp';

    public static function generateInvoiceFileName(string $prefix, int $id): string
    {
        return Invoice::MODULE_NAME . '-' . sanitize_file_name($prefix) . '-' . $id . '.pdf';
    }

    public static function getInvoiceDetails(int $invoiceId): ?array
    {
        try {
            $result = self::invoiceJoinQuery($invoiceId)->first();

            if (!$result instanceof Invoice) {
                return null;
            }

            $row = $result->getAttributes();

            $invoice = self::hydrate(new Invoice(), self::columnsByAlias($row, new Invoice()));
            $deal = self::hydrate(new Deal(), self::columnsByAlias($row, new Deal()));
            $contact = self::hydrate(new Contact(), self::columnsByAlias($row, new Contact()));

            $lineItems = self::getLineItems($invoice->id);

            $lineItems = !empty($lineItems) ? $lineItems->toArray() : [];

            return [
                'invoice'       => $invoice,
                'deal'          => $deal,
                'contact'       => $contact,
                'line_items'    => $lineItems,
                'currency_data' => self::getDealCurrencyData($deal),
            ];
        } catch (Throwable $th) {
            Logger::error($th);

            return null;
        }
    }

    public static function sendInvoice(string $email, int $dealId, array $attachments, ?string $shareUrl = null): bool
    {
        $subject = __('Your Invoice', 'bit-crm-sales-marketing-automation');
        $message = '<p>' . esc_html__('Please find your invoice attached.', 'bit-crm-sales-marketing-automation') . '</p>';

        if (!empty($shareUrl)) {
            $message .= '<p>'
                . esc_html__('You can also view and pay your invoice online using the link below:', 'bit-crm-sales-marketing-automation')
                . '</p>'
                . '<p><a href="' . esc_url($shareUrl) . '">' . esc_html($shareUrl) . '</a></p>';
        }

        $result = (new EmailService())->send(
            [
                'entity_email' => $email,
                'module'       => Deal::MODULE_NAME,
                'entity_id'    => $dealId,
                'subject'      => $subject,
                'message'      => $message,
            ],
            $attachments
        );

        return !empty($result['success']);
    }

    /**
     * Sends an invoice to its deal's email — PDF attached, share link in the
     * body — then publishes it as sent/overdue. The single entry point for
     * every caller (REST, automations), so no two paths send differently.
     *
     * @return array{success: bool, message: string}
     */
    public static function sendInvoiceById(int $invoiceId): array
    {
        $invoice = Invoice::findOne(['id' => $invoiceId]);

        if (empty($invoice)) {
            return ['success' => false, 'message' => __('Invoice not found!', 'bit-crm-sales-marketing-automation')];
        }

        $deal = $invoice->module === Deal::MODULE_NAME
            ? Deal::select(['id', 'name', 'email'])->findOne(['id' => $invoice->entity_id])
            : null;

        if (empty($deal) || empty($deal['email'])) {
            return ['success' => false, 'message' => __('Deal email address not found!', 'bit-crm-sales-marketing-automation')];
        }

        $tempDir = null;
        $tempFile = null;
        $emailSent = false;

        try {
            $invoicePdfService = new InvoicePdfService();
            $mpdf = $invoicePdfService->generate($invoiceId);

            $invoiceFileName = self::generateInvoiceFileName($invoice->invoice_prefix, (int) $invoice->id);

            $tempDir = Config::get('UPLOAD_BASE_DIR') . self::TEMP_DIR . '/' . uniqid('', true);
            wp_mkdir_p($tempDir);

            $tempFile = $tempDir . '/' . $invoiceFileName;
            $mpdf->Output($tempFile, 'F');

            $shareUrl = (new InvoiceShareTokenService())->getPublicInvoiceUrl($invoice);

            $emailSent = self::sendInvoice($deal['email'], (int) $deal['id'], [$tempFile], $shareUrl);
        } catch (Throwable $th) {
            return ['success' => false, 'message' => __('Failed to send invoice!', 'bit-crm-sales-marketing-automation')];
        } finally {
            if ($tempFile !== null && FileHandler::isValidPath($tempFile)) {
                wp_delete_file($tempFile);
            }
            if ($tempDir !== null && is_dir($tempDir)) {
                File::removeDirectory($tempDir);
            }
        }

        if (!$emailSent) {
            return ['success' => false, 'message' => __('Failed to send invoice email!', 'bit-crm-sales-marketing-automation')];
        }

        try {
            self::publishInvoice($invoice, true);
        } catch (Throwable $th) {
            return ['success' => true, 'message' => __('Invoice sent, but status could not be updated. Please refresh.', 'bit-crm-sales-marketing-automation')];
        }

        return ['success' => true, 'message' => __('Invoice sent successfully', 'bit-crm-sales-marketing-automation')];
    }

    public static function isPastDue(Invoice $invoice): bool
    {
        return !empty($invoice->due_date)
            && substr((string) $invoice->due_date, 0, 10) < current_time('Y-m-d');
    }

    /**
     * Publishes an invoice for sending/sharing: re-derives sent/overdue from
     * the due date unless the status is payment-derived (paid/partially paid),
     * and stamps sent_at. Both the email-send and share-link flows go through
     * here so the two paths can never publish a status differently.
     *
     * @param bool $refreshSentAt also stamp sent_at when the status is
     *                            unchanged — the email flow records every
     *                            send; the share-link flow leaves
     *                            already-published invoices untouched
     *
     * @return bool whether the status changed
     */
    public static function publishInvoice(Invoice $invoice, bool $refreshSentAt = false): bool
    {
        $isPaymentDerived = $invoice->status === Invoice::STATUS_PAID
            || $invoice->status === Invoice::STATUS_PARTIALLY_PAID;

        $publishStatus = self::isPastDue($invoice) ? Invoice::STATUS_OVERDUE : Invoice::STATUS_SENT;
        $statusChanged = !$isPaymentDerived && $publishStatus !== $invoice->status;

        if (!$statusChanged && !$refreshSentAt) {
            return false;
        }

        $updateData = [
            'sent_at'    => current_time('mysql', true),
            'updated_by' => get_current_user_id(),
        ];

        if ($statusChanged) {
            $updateData['status'] = $publishStatus;
        }

        $invoice->update($updateData);

        if ($statusChanged) {
            $invoice = (new LineItemService($invoice->id, Invoice::MODULE_NAME))->appendLineItems($invoice);
            Hooks::doAction('bit_crm/invoice_status_updated', $invoice);
        }

        return $statusChanged;
    }

    public static function runOverdueInvoiceCheck(): void
    {
        $startedAt = (int) Config::getOption(MarkOverdueInvoicesProcess::IS_RUNNING_KEY);

        /*
         * Skip if a previous run is still in flight, but treat the flag as
         * stale if it's older than a day — guards against fatal-error orphans
         * that would otherwise block every subsequent daily run.
         */
        if ($startedAt > 0 && (time() - $startedAt) < DAY_IN_SECONDS) {
            return;
        }

        Config::updateOption(MarkOverdueInvoicesProcess::IS_RUNNING_KEY, time());

        (new MarkOverdueInvoicesProcess())
            ->push_to_queue([])
            ->save()
            ->dispatch();
    }

    public static function getDealCurrencyData(Deal $deal)
    {
        $currencies = (new CurrencyService())->getCurrencyMap();

        return $currencies[$deal->currency] ?? CurrencyHelper::getHomeCurrencyData();
    }

    /**
     * Resolve an invoice's deal-currency and home-currency grand totals directly from the
     * raw request line items, before the invoice/line-items are persisted.
     *
     * The line items are normalized (clamped) and per-item converted to home currency the
     * same way LineItemService does, so the returned totals match exactly what will be
     * stored once the line items are synced. This lets the invoice be written in a single
     * insert (mirroring how DealService computes home_currency_amount before insert).
     *
     * @param array<int, array<string, mixed>> $requestLineItems raw 'line_items' from the request
     *
     * @return array{amount: string, home_currency_amount: string}
     */
    public static function resolveInvoiceAmounts(
        array $requestLineItems,
        ?string $currency,
        string $taxOption,
        float $grossDiscountAmount,
        string $grossDiscountType
    ): array {
        $currencyService = new CurrencyService();
        $lineItemService = new LineItemService(null, null);
        $homeCurrency = CurrencyHelper::getHomeCurrency();

        // Normalize each line item (clamp + convert to home currency) using the same rules
        // LineItemService applies at save time, so the total matches what will be persisted.
        $normalized = [];
        foreach ($requestLineItems as $item) {
            $productData = $lineItemService->getProductData($item);
            $unitPriceInDealCurrency = (float) $productData['unit_price'];
            $quantity = (int) $productData['quantity'];
            $discountPercentage = (float) $productData['discount_percentage'];
            $taxRate = (float) $productData['tax_rate'];

            $unitPriceInHomeCurrency = $unitPriceInDealCurrency;
            if ($currency && $currency !== $homeCurrency) {
                $unitPriceInHomeCurrency = $currencyService->convertIntoHomeCurrency($unitPriceInDealCurrency, $currency);
            }

            $normalized[] = [
                'unit_price_in_deal_currency' => $unitPriceInDealCurrency,
                'unit_price_in_home_currency' => $unitPriceInHomeCurrency,
                'quantity'                    => $quantity,
                'discount_percentage'         => $discountPercentage,
                'tax_rate'                    => $taxRate,
                'taxes'                       => $productData['taxes'] ?? null,
            ];
        }

        // A flat ('amount') gross discount is expressed in the invoice currency, so it must
        // be converted to home currency before subtracting from the home-currency subtotal.
        // A 'rate' discount is proportional and needs no conversion.
        $homeGrossDiscountAmount = $grossDiscountAmount;
        if ($grossDiscountType !== 'rate' && $grossDiscountAmount > 0 && $currency && $currency !== $homeCurrency) {
            $homeGrossDiscountAmount = $currencyService->convertIntoHomeCurrency($grossDiscountAmount, $currency);
        }

        return [
            'amount' => self::calculateGrandTotal(
                $normalized,
                $taxOption,
                $grossDiscountAmount,
                $grossDiscountType,
                'unit_price_in_deal_currency',
                $currencyService->getDecimalPlaces($currency)
            ),
            'home_currency_amount' => self::calculateGrandTotal(
                $normalized,
                $taxOption,
                $homeGrossDiscountAmount,
                $grossDiscountType,
                'unit_price_in_home_currency',
                $currencyService->getDecimalPlaces($homeCurrency)
            ),
        ];
    }

    /**
     * Compute an invoice's subtotal, tax, gross discount and grand total from its line items,
     * reading unit prices from $unitPriceColumn ('unit_price_in_deal_currency' or
     * 'unit_price_in_home_currency'). Returns raw floats — the single source of truth for the
     * total math, consumed by calculateGrandTotal() (storage) and InvoicePdfService (rendering).
     * With a $precision, lines that carry named taxes are rounded one by one.
     *
     * @param array<int, array<string, mixed>> $lineItems
     * @param null|int                         $precision decimals of the currency the amounts are in
     *
     * @return array{subtotal: float, totalTax: float, discount: float, grandTotal: float, taxBreakdown: array<string, float>, lineTotals: array<int|string, float>}
     */
    public static function computeTotals(
        array $lineItems,
        string $taxOption,
        float $grossDiscountAmount,
        string $grossDiscountType,
        string $unitPriceColumn = 'unit_price_in_deal_currency',
        ?int $precision = null
    ): array {
        $subtotal = 0.0;
        $totalTax = 0.0;
        $taxBreakdown = [];
        $lineTotals = [];
        $isExclusive = $taxOption === LineItem::TAX_EXCLUSIVE;
        $isInclusive = $taxOption === LineItem::TAX_INCLUSIVE;
        $isRoundedPerTax = $precision !== null
            && ($isExclusive || $isInclusive)
            && !empty(array_filter($lineItems, static fn ($item) => !empty($item['taxes']) && \is_array($item['taxes'])));

        $currencyService = new CurrencyService();

        foreach ($lineItems as $key => $item) {
            if ($isRoundedPerTax) {
                $line = self::computeLineAmounts($item, $taxOption, $precision, $unitPriceColumn, $currencyService);
                $subtotal += $line['net'];
                $lineTotals[$key] = $line['total'];

                foreach ($line['taxes'] as $label => $amount) {
                    $taxBreakdown[$label] = ($taxBreakdown[$label] ?? 0) + $amount;
                    $totalTax += $amount;
                }

                continue;
            }

            $unitPrice = (float) ($item[$unitPriceColumn] ?? 0);
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

        $discount = self::calculateGrossDiscount($subtotal, $totalTax, $grossDiscountAmount, $grossDiscountType);

        if ($isRoundedPerTax) {
            $discount = $currencyService->roundAmount($discount, $precision);
        }

        $otherTax = self::getOtherTaxLabel();

        // Listed after the named taxes; alone, the single tax row is shown instead.
        if (isset($taxBreakdown[$otherTax])) {
            $otherTaxAmount = $taxBreakdown[$otherTax];
            unset($taxBreakdown[$otherTax]);
            $taxBreakdown = $taxBreakdown ? $taxBreakdown + [$otherTax => $otherTaxAmount] : [];
        }

        return [
            'subtotal'     => $subtotal,
            'totalTax'     => $totalTax,
            'discount'     => $discount,
            'grandTotal'   => max(0.0, $subtotal + $totalTax - $discount),
            'taxBreakdown' => $taxBreakdown,
            'lineTotals'   => $lineTotals,
        ];
    }

    /**
     * Compute an invoice grand total (subtotal + tax − gross discount) from its line items,
     * reading unit prices from $unitPriceColumn ('unit_price_in_deal_currency' or
     * 'unit_price_in_home_currency'). Returns a monetary string.
     *
     * @param array<int, array<string, mixed>> $lineItems
     */
    public static function calculateGrandTotal(
        array $lineItems,
        string $taxOption,
        float $grossDiscountAmount,
        string $grossDiscountType,
        string $unitPriceColumn,
        ?int $precision = null
    ): string {
        $totals = self::computeTotals($lineItems, $taxOption, $grossDiscountAmount, $grossDiscountType, $unitPriceColumn, $precision);

        return number_format(
            $totals['grandTotal'],
            LineItem::MONETARY_PRECISION,
            LineItem::MONETARY_DECIMAL_POINT,
            LineItem::MONETARY_THOUSANDS_SEPARATOR
        );
    }

    /**
     * Resolve the invoice-level gross discount as an absolute amount.
     * 'rate' => percentage of (subtotal + tax); otherwise a flat amount.
     */
    public static function calculateGrossDiscount(
        float $subtotal,
        float $totalTax,
        float $grossDiscountAmount,
        string $grossDiscountType
    ): float {
        if ($grossDiscountAmount <= 0) {
            return 0.0;
        }

        if ($grossDiscountType === 'rate') {
            return ($subtotal + $totalTax) * (min($grossDiscountAmount, 100) / 100);
        }

        return min($grossDiscountAmount, $subtotal + $totalTax);
    }

    /**
     * What each tax adds to the net amount, in percent; a compound tax is charged on top of the ones before it.
     *
     * @param array<int, array<string, mixed>> $taxes
     *
     * @return array<int, float>
     */
    public static function getTaxShares(array $taxes): array
    {
        $shares = [];
        $combinedRate = 0.0;

        foreach ($taxes as $tax) {
            $share = (empty($tax['is_compound']) ? 100 : 100 + $combinedRate) * (float) ($tax['rate'] ?? 0) / 100;
            $shares[] = $share;
            $combinedRate += $share;
        }

        return $shares;
    }

    /**
     * @param array<string, mixed> $item
     *
     * @return array{net: float, taxes: array<string, float>, total: float}
     */
    private static function computeLineAmounts(
        array $item,
        string $taxOption,
        int $precision,
        string $unitPriceColumn,
        CurrencyService $currencyService
    ): array {
        $taxRate = (float) ($item['tax_rate'] ?? 0);
        $isInclusive = $taxOption === LineItem::TAX_INCLUSIVE;
        $afterDiscount = (float) ($item[$unitPriceColumn] ?? 0)
            * (float) ($item['quantity'] ?? 0)
            * (1 - (float) ($item['discount_percentage'] ?? 0) / 100);
        $lineAmount = $currencyService->roundAmount($afterDiscount, $precision);
        $taxableAmount = $isInclusive ? $lineAmount / (1 + $taxRate / 100) : $lineAmount;
        $taxes = [];

        foreach (self::getLineTaxShares($item, $taxRate) as $label => $share) {
            $taxes[$label] = $currencyService->roundAmount($taxableAmount * $share / 100, $precision);
        }

        $tax = array_sum($taxes);

        return [
            'net'   => $isInclusive ? $lineAmount - $tax : $lineAmount,
            'taxes' => $taxes,
            'total' => $isInclusive ? $lineAmount : $lineAmount + $tax,
        ];
    }

    /**
     * A rate from no tax rule (typed, or a line without named taxes) is listed as "Other tax".
     *
     * @param array<string, mixed> $item
     *
     * @return array<string, float>
     */
    private static function getLineTaxShares(array $item, float $taxRate): array
    {
        $singleTax = $taxRate > 0 ? [['rate' => $taxRate]] : [];
        $taxes = array_values(\is_array($item['taxes'] ?? null) ? $item['taxes'] : $singleTax);
        $shares = [];

        foreach (self::getTaxShares($taxes) as $index => $share) {
            $tax = $taxes[$index];
            $rate = (float) ($tax['rate'] ?? 0);
            $label = $rate > 0 ? \sprintf('%s (%s%%)', $tax['name'] ?? '', $rate) : (string) ($tax['name'] ?? '');

            if ($rate > 0 && empty($tax['id'])) {
                $label = self::getOtherTaxLabel();
            }

            $shares[$label] = ($shares[$label] ?? 0) + $share;
        }

        return $shares;
    }

    private static function invoiceJoinQuery(int $invoiceId): QueryBuilder
    {
        $invoiceTable = Config::withDBPrefix('invoices');
        $dealTable = Config::withDBPrefix('deals');
        $contactTable = Config::withDBPrefix('contacts');

        $select = array_merge(
            self::aliasColumns($invoiceTable, new Invoice()),
            self::aliasColumns($dealTable, new Deal()),
            self::aliasColumns($contactTable, new Contact())
        );

        return Invoice::select($select)
            ->join('deals', "{$dealTable}.id", '=', "{$invoiceTable}.entity_id")
            ->join('contacts', "{$contactTable}.id", '=', "{$dealTable}.contact_id")
            ->where("{$invoiceTable}.id", $invoiceId)
            ->where("{$invoiceTable}.module", Deal::MODULE_NAME);
    }

    /**
     * @param Contact|Deal|Invoice $model
     */
    private static function aliasColumns(string $table, Model $model): array
    {
        $alias = $model::MODULE_NAME . '_';
        $columns = array_merge($model->getFillable(), ['id', 'created_at', 'updated_at']);

        return array_map(
            static fn ($column) => "{$table}.{$column} AS {$alias}{$column}",
            $columns
        );
    }

    /**
     * @param Contact|Deal|Invoice $model
     */
    private static function columnsByAlias(array $row, Model $model): array
    {
        $alias = $model::MODULE_NAME . '_';
        $columns = [];

        foreach ($row as $key => $value) {
            if (strncmp($key, $alias, \strlen($alias)) === 0) {
                $columns[substr($key, \strlen($alias))] = $value;
            }
        }

        return $columns;
    }

    private static function hydrate($model, array $attributes)
    {
        $model->fill($attributes, true);
        $model->setExists(true);

        return $model;
    }

    private static function getLineItems(int $invoiceId)
    {
        return LineItem::find(['entity_id' => $invoiceId, 'module' => Invoice::MODULE_NAME]);
    }

    private static function getOtherTaxLabel(): string
    {
        return __('Other tax', 'bit-crm-sales-marketing-automation');
    }
}
