<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Deps\BitApps\WPDatabase\Connection;
use BitApps\Crm\Deps\BitApps\WPKit\Helpers\JSON;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Model\Invoice;
use BitApps\Crm\Model\InvoicePayment;
use BitApps\Crm\Model\LineItem;
use BitApps\Crm\Utils\Logger;
use Exception;
use Throwable;

/**
 * The payment ledger operations FREE owns: recording an offline settlement
 * ("Mark as Paid"), reading an invoice's payment history and totals, and
 * projecting its status from the payment rows.
 *
 * Deliberately knows nothing about checkout providers. Collecting money —
 * creating checkouts, locking exchange rates, handling provider events,
 * refunds, partial and recurring payments — is pro's InvoicePaymentService,
 * which extends this base rather than restating it. Keeping the status rule
 * in ONE place is the point: an invoice must not land on a different status
 * depending on whether free or pro wrote the row.
 *
 * The ledger lives here so the records outlive the pro plugin (see
 * InvoicePayment); pro only adds the provider-collected rows to it.
 */
class InvoiceLedgerService
{
    /**
     * Fallback minor-unit precision for invoice amounts when the invoice
     * currency does not declare its own decimal_places.
     */
    public const DEFAULT_CURRENCY_DECIMALS = 2;

    /**
     * Records a settlement that reached the merchant OUTSIDE any checkout
     * engine — cash, bank transfer, cheque — as a completed ledger row, then
     * lets the invoice status derive itself from the history like every other
     * payment.
     *
     * This is what "Mark as Paid" does. The older path wrote `status = paid`
     * with no row at all, which left the summary claiming a payment the
     * history could not show; going through the ledger means one status
     * authority and a settlement an admin can actually reconcile.
     *
     * Always settles the FULL remaining due: a manual row exists to explain a
     * paid invoice, not to script an installment plan (partial collection is
     * the checkout provider's job). The amount is therefore computed here,
     * never taken from the request.
     *
     * No provider is involved, so there is no currency conversion and no
     * locked fx rate: the row is booked in the invoice's own currency and
     * carries no DATA_CHARGED_* values. `provider_ref` is minted locally to
     * keep the (provider, provider_ref) identity unique.
     *
     * @param array{paid_at?: string, reference?: string, note?: string} $details
     *                                                                             already sanitized by the request layer
     *
     * @throws Exception when the invoice has nothing left to settle
     */
    public function recordManualPayment(Invoice $invoice, array $details = []): InvoicePayment
    {
        if ($invoice->status === Invoice::STATUS_DRAFT) {
            throw new Exception(esc_html__('Send the invoice before recording a payment against it.', 'bit-crm-sales-marketing-automation'));
        }

        // Fetched once and threaded through: the grand total, currency and
        // decimals cannot change while the row is being written.
        $invoiceDetails = InvoiceService::getInvoiceDetails((int) $invoice->id);
        $summary = $invoiceDetails === null ? null : $this->getPaymentSummary($invoice, $invoiceDetails);

        if ($summary === null) {
            throw new Exception(esc_html__('This invoice could not be read. Please try again.', 'bit-crm-sales-marketing-automation'));
        }

        // A zero-total invoice is not covered until its first completed row,
        // so this lets that row through and refuses a second one.
        if ($this->isCovered($summary)) {
            throw new Exception(esc_html__('This invoice has nothing left to pay.', 'bit-crm-sales-marketing-automation'));
        }

        $paidAt = $this->normalizeManualPaidAt($details['paid_at'] ?? null);

        try {
            Connection::startTransaction();

            $payment = InvoicePayment::insert([
                'entity_id'     => $invoice->id,
                'module'        => Invoice::MODULE_NAME,
                'provider'      => InvoicePayment::PROVIDER_MANUAL,
                'provider_ref'  => $this->manualPaymentRef((int) $invoice->id),
                'amount'        => number_format($summary['due'], LineItem::MONETARY_PRECISION, LineItem::MONETARY_DECIMAL_POINT, LineItem::MONETARY_THOUSANDS_SEPARATOR),
                'currency'      => $summary['currency'],
                'provider_data' => [
                    InvoicePayment::DATA_REFERENCE       => (string) ($details['reference'] ?? ''),
                    InvoicePayment::DATA_NOTE            => (string) ($details['note'] ?? ''),
                    InvoicePayment::DATA_REFUNDED_AMOUNT => '0',
                ],
                'status'     => InvoicePayment::STATUS_COMPLETED,
                'paid_at'    => $paidAt,
                'created_by' => get_current_user_id() ?: null,
            ]);

            // Model::insert() returns falsy on a rejected write instead of
            // throwing — even inside a transaction.
            if (empty($payment) || empty($payment->id)) {
                throw new Exception('Invoice payment row was not inserted.');
            }

            // A manual row settles the full due, so the only correct outcome
            // is `paid`; anything else means the projection did not take and
            // the row must not survive on its own.
            if ($this->syncInvoicePaymentStatus((int) $invoice->id, false, $invoiceDetails) !== Invoice::STATUS_PAID) {
                throw new Exception('Invoice status did not settle to paid after the manual payment.');
            }

            Connection::commit();
        } catch (Throwable $th) {
            Connection::rollBack();
            Logger::error($th);

            throw new Exception(esc_html__('Failed to record the payment. Please try again.', 'bit-crm-sales-marketing-automation'));
        }

        return $payment;
    }

    /**
     * Grand total, completed-payment total and remaining due of an invoice.
     *
     * The paid amount is always recomputed fresh from the payment rows — the
     * rows are the source of truth, never a running total. A caller that has
     * already loaded the rows (or the invoice details) passes them in so one
     * request never reads the same table twice.
     *
     * @param null|array $rows flattened payment rows, from paymentRows() or getPayments()
     *
     * @return null|array{total: float, paid: float, has_completed_payment: bool, due: float, minimum_payment_amount: float, currency: string, decimal_places: int}
     */
    public function getPaymentSummary(Invoice $invoice, ?array $details = null, ?array $rows = null): ?array
    {
        try {
            $details = $details ?? InvoiceService::getInvoiceDetails((int) $invoice->id);

            if ($details === null) {
                return null;
            }

            $decimals = $this->currencyDecimals($details['currency_data'] ?? []);
            $totals = (new InvoicePdfService())->calculateTotals($invoice, $details['line_items']);
            $total = round($totals->grandTotal, $decimals);
            $rows = $rows ?? $this->paymentRows((int) $invoice->id);
            $paid = $this->getCompletedPaymentTotal($rows, $decimals);
            $due = max(0.0, round($total - $paid, $decimals));

            return [
                'total'                  => $total,
                'paid'                   => $paid,
                'has_completed_payment'  => \in_array(InvoicePayment::STATUS_COMPLETED, array_column($rows, 'status'), true),
                'due'                    => $due,
                'minimum_payment_amount' => $this->getMinimumPartialPaymentAmount($invoice, $total, $due, $decimals),
                'currency'               => (string) ($details['currency_data']['currency'] ?? ''),
                'decimal_places'         => $decimals,
            ];
        } catch (Throwable $th) {
            Logger::error($th);

            return null;
        }
    }

    /**
     * Summary shaped for API responses. A `paid` invoice always reads as fully
     * settled (paid=total, due=0) even when the payment rows don't cover the
     * total — an invoice marked paid before the ledger existed has no rows at
     * all. Display only: status derivation and payment validation must keep
     * using getPaymentSummary(), whose `paid` is the true row sum.
     *
     * @return null|array{total: float, paid: float, has_completed_payment: bool, due: float, minimum_payment_amount: float, currency: string, decimal_places: int}
     */
    public function getDisplayPaymentSummary(Invoice $invoice, ?array $details = null, ?array $rows = null): ?array
    {
        $summary = $this->getPaymentSummary($invoice, $details, $rows);

        if ($summary === null || $invoice->status !== Invoice::STATUS_PAID) {
            return $summary;
        }

        $summary['paid'] = max($summary['paid'], $summary['total']);
        $summary['due'] = 0.0;
        $summary['minimum_payment_amount'] = 0.0;

        return $summary;
    }

    /**
     * Payments of an invoice shaped for display: paymentRows() plus a
     * `provider_label` naming what collected the money, who recorded a manual
     * row, and a formatted `refunded_amount` — the refunded portion expressed
     * in the invoice currency — so consumers can render the net amount
     * without redoing currency math.
     */
    public function getPayments(int $invoiceId): array
    {
        return array_map(
            function (array $payment): array {
                $payment['provider_label'] = $this->providerLabel($payment);
                // Only meaningful for manual rows — a provider row's created_by
                // is whoever happened to trigger the checkout, not who
                // collected the money.
                $payment['recorded_by'] = $payment['is_manual']
                    ? CommonService::resolveUserDisplayName($payment['created_by'] ?? null)
                    : null;
                $payment['refunded_amount'] = number_format(
                    $this->refundedInvoiceAmount($payment, LineItem::MONETARY_PRECISION),
                    LineItem::MONETARY_PRECISION,
                    LineItem::MONETARY_DECIMAL_POINT,
                    LineItem::MONETARY_THOUSANDS_SEPARATOR
                );

                return $payment;
            },
            $this->paymentRows($invoiceId)
        );
    }

    /**
     * Payments of an invoice, newest first, with the provider_data JSON
     * flattened onto the row: the provider-collected values
     * (`charged_amount`/`charged_currency`/`fx_rate`/`charged_refunded_amount`)
     * and the offline-settlement details (`reference`/`note`). Provider
     * fields are null on a manual row and vice versa.
     *
     * This is the arithmetic shape — what totals and status derivation read.
     * It does no user lookups and no string formatting, so the summary/sync
     * paths that run on every provider event never pay for display work.
     */
    public function paymentRows(int $invoiceId): array
    {
        $payments = InvoicePayment::where('entity_id', $invoiceId)
            ->where('module', Invoice::MODULE_NAME)
            ->orderBy('id')->desc()
            ->get();

        if (empty($payments)) {
            return [];
        }

        return array_map(
            function (array $payment): array {
                $data = $this->paymentProviderData($payment);

                $payment['charged_amount'] = $data[InvoicePayment::DATA_CHARGED_AMOUNT] ?? null;
                $payment['charged_currency'] = $data[InvoicePayment::DATA_CHARGED_CURRENCY] ?? null;
                $payment['charged_refunded_amount'] = $data[InvoicePayment::DATA_REFUNDED_AMOUNT] ?? '0';
                $payment['fx_rate'] = $data[InvoicePayment::DATA_FX_RATE] ?? null;
                $payment['reference'] = $data[InvoicePayment::DATA_REFERENCE] ?? null;
                $payment['note'] = $data[InvoicePayment::DATA_NOTE] ?? null;
                // What lets the UI mark a row as recorded by hand instead of
                // showing its meaningless locally-minted ref.
                $payment['is_manual'] = ($payment['provider'] ?? '') === InvoicePayment::PROVIDER_MANUAL;

                unset($payment['provider_data']);

                return $payment;
            },
            $payments->toArray()
        );
    }

    /**
     * Projects the invoice status from its payment history.
     *
     * Returns the status the invoice holds afterwards (unchanged or freshly
     * applied), or null when nothing could be projected — no such invoice,
     * a draft, or unreadable details. A rejected status write throws so the
     * caller's transaction can decide: the manual path rolls back, while pro's
     * provider handlers log it and keep the payment the provider already took.
     * A failing listener on the status hook is always swallowed, since a third
     * party's bug must not undo a payment.
     *
     * @param bool       $allowPaidDowngrade whether a fully payment-backed `paid`
     *                                       status may fall back after a revocation
     * @param null|array $details            invoice details already in hand, to
     *                                       spare a second fetch
     *
     * @throws Exception when the status write is rejected
     */
    public function syncInvoicePaymentStatus(int $invoiceId, bool $allowPaidDowngrade = false, ?array $details = null): ?string
    {
        $invoice = Invoice::findOne(['id' => $invoiceId]);

        if (empty($invoice) || $invoice->is_trash || $invoice->status === Invoice::STATUS_DRAFT) {
            return null;
        }

        $summary = $this->getPaymentSummary($invoice, $details);

        if ($summary === null) {
            return null;
        }

        $status = $this->deriveStatus($invoice, $summary, $allowPaidDowngrade);

        if ($status === $invoice->status) {
            return $status;
        }

        $updateData = ['status' => $status];

        if ($status === Invoice::STATUS_PAID) {
            $updateData['paid_at'] = current_time('mysql', true);
        }

        if ($invoice->update($updateData) === false) {
            throw new Exception('Invoice status update was rejected.');
        }

        try {
            Hooks::doAction('bit_crm/invoice_status_updated', $invoice);
        } catch (Throwable $th) {
            Logger::error($th);
        }

        return $status;
    }

    /**
     * Minimum a customer may pay when partial payment is allowed. Free never
     * offers partial payment, so the base is always 0; pro overrides it.
     */
    protected function getMinimumPartialPaymentAmount(Invoice $invoice, float $total, float $due, int $decimals = self::DEFAULT_CURRENCY_DECIMALS): float
    {
        return 0.0;
    }

    /**
     * The status an invoice should hold given its payment history.
     *
     * Shared by free and pro so a row written by either path lands the invoice
     * on the same status.
     */
    protected function deriveStatus(Invoice $invoice, array $summary, bool $allowPaidDowngrade): string
    {
        if ($this->isCovered($summary)) {
            return Invoice::STATUS_PAID;
        }

        // A `paid` status without covering ledger rows — set before the
        // ledger existed, or by a writer that bypasses it — is never
        // downgraded by payment events.
        if ($invoice->status === Invoice::STATUS_PAID && !$allowPaidDowngrade) {
            return Invoice::STATUS_PAID;
        }

        if ($summary['paid'] > 0) {
            return Invoice::STATUS_PARTIALLY_PAID;
        }

        if ($invoice->status === Invoice::STATUS_PARTIALLY_PAID || $invoice->status === Invoice::STATUS_PAID) {
            // Every counted payment was revoked — fall back by due date.
            return InvoiceService::isPastDue($invoice) ? Invoice::STATUS_OVERDUE : Invoice::STATUS_SENT;
        }

        return $invoice->status;
    }

    /**
     * Whether the completed payments cover the grand total — the one
     * definition of "fully paid by the ledger", used for status derivation,
     * for refusing a redundant manual payment, and by pro to tell a
     * payment-backed `paid` from a legacy one.
     *
     * A zero-total invoice owes nothing, so the amounts alone would call it
     * covered from the start and every status sync would flip a sent $0
     * invoice to `paid`. It is covered only once a completed row exists —
     * the one a user writes by marking it paid.
     *
     * @param array{total: float, paid: float, has_completed_payment?: bool, decimal_places: int} $summary
     */
    protected function isCovered(array $summary): bool
    {
        $epsilon = $this->amountEpsilon($summary['decimal_places']);

        if ($summary['total'] <= $epsilon) {
            return !empty($summary['has_completed_payment']);
        }

        return $summary['paid'] >= $summary['total'] - $epsilon;
    }

    /**
     * Completed money collected against an invoice, net of refunds, in the
     * invoice's own currency.
     *
     * @param array $rows flattened payment rows, from paymentRows() or getPayments()
     */
    protected function getCompletedPaymentTotal(array $rows, int $decimals = self::DEFAULT_CURRENCY_DECIMALS): float
    {
        $paid = 0.0;

        foreach ($rows as $payment) {
            if (($payment['status'] ?? '') === InvoicePayment::STATUS_COMPLETED) {
                $amount = (float) ($payment['amount'] ?? 0);
                $paid += max(0.0, $amount - $this->refundedInvoiceAmount($payment, $decimals));
            }
        }

        return round($paid, $decimals);
    }

    /**
     * Refunded portion of a payment expressed in the invoice currency, using
     * the exchange rate LOCKED in provider_data at creation — a payment and
     * its refund must always cancel exactly regardless of later rate drift.
     * A row with no checkout currency was booked in the invoice's own.
     *
     * @param array $payment row already flattened by paymentRows()
     */
    protected function refundedInvoiceAmount(array $payment, int $decimals): float
    {
        $refunded = (float) ($payment['charged_refunded_amount'] ?? 0);

        if ($refunded <= 0) {
            return 0.0;
        }

        $fxRate = (float) ($payment['fx_rate'] ?? 0);

        if ($fxRate <= 0) {
            // Row without a locked rate: only a same-currency refund can be
            // applied safely; anything else must not distort the ledger.
            $chargedCurrency = $payment['charged_currency'] ?? '';
            $fxRate = $chargedCurrency === '' || $chargedCurrency === ($payment['currency'] ?? '') ? 1.0 : 0.0;
        }

        return $fxRate > 0 ? round($refunded / $fxRate, $decimals) : 0.0;
    }

    /**
     * Human name of what collected a payment: "Manual" for a hand-recorded
     * row, otherwise the provider key humanised ("woocommerce" → "Woocommerce").
     * Free knows no checkout providers, so the key is the best it can do; the
     * pro plugin relabels registered providers with their real names when it
     * extends the payload.
     */
    protected function providerLabel(array $payment): string
    {
        if (!empty($payment['is_manual'])) {
            return __('Manual', 'bit-crm-sales-marketing-automation');
        }

        return ucfirst(str_replace('_', ' ', (string) ($payment['provider'] ?? '')));
    }

    /**
     * Minor-unit precision of the invoice currency, from the CRM currency
     * settings. Clamped to the ledger's own storage precision.
     */
    protected function currencyDecimals(array $currencyData): int
    {
        $decimals = $currencyData['decimal_places'] ?? self::DEFAULT_CURRENCY_DECIMALS;

        return is_numeric($decimals)
            ? max(0, min(LineItem::MONETARY_PRECISION, (int) $decimals))
            : self::DEFAULT_CURRENCY_DECIMALS;
    }

    /**
     * Two invoice-currency amounts closer than this are equal — half the
     * currency's minor unit, so float noise from currency math can never
     * leave an invoice stuck at partially paid.
     */
    protected function amountEpsilon(int $decimals): float
    {
        return 0.5 * (10 ** -$decimals) + 1e-9;
    }

    /**
     * provider_data of a payment row, guaranteed as an array — whether it
     * arrives cast, raw JSON (Collection::toArray bypasses attribute casts)
     * or missing.
     */
    protected function paymentProviderData(array $payment): array
    {
        $data = JSON::maybeDecode($payment['provider_data'] ?? null, true);

        return \is_array($data) ? $data : [];
    }

    /**
     * Locally minted identity for a manual row. No checkout engine issues a
     * reference for cash, so the ledger mints its own — unique per row, and
     * recognisable as CRM-issued rather than looking like a provider order id.
     */
    protected function manualPaymentRef(int $invoiceId): string
    {
        return \sprintf(
            '%s_%d_%s',
            InvoicePayment::PROVIDER_MANUAL,
            $invoiceId,
            strtolower(wp_generate_password(8, false))
        );
    }

    /**
     * The settlement datetime in GMT, as the ledger stores every date.
     *
     * The picker sends its value the way `invoice_date`/`due_date` are sent —
     * an ISO-8601 string carrying an explicit offset (`…T08:32:07.000Z`), so
     * `strtotime()` already resolves it to the right instant and the result
     * only needs formatting as GMT, never a second conversion.
     *
     * A value with no offset is read as site time, which is what a hand-built
     * request or an older client sends. Anything unparsable or in the future
     * falls back to now: a payment cannot have settled before it was recorded.
     *
     * @param mixed $paidAt ISO-8601 (or site-timezone) datetime from the request
     */
    protected function normalizeManualPaidAt($paidAt): string
    {
        $now = current_time('mysql', true);

        if (!\is_string($paidAt) || trim($paidAt) === '') {
            return $now;
        }

        $paidAt = trim($paidAt);
        $timestamp = strtotime($paidAt);

        if ($timestamp === false) {
            return $now;
        }

        // `strtotime()` reads an offset-less string in the server's timezone,
        // which WordPress pins to UTC — so that case, and only that case,
        // still needs the site-time conversion.
        $gmt = $this->hasTimezoneOffset($paidAt)
            ? gmdate('Y-m-d H:i:s', $timestamp)
            : get_gmt_from_date(gmdate('Y-m-d H:i:s', $timestamp));

        return $gmt > $now ? $now : $gmt;
    }

    /**
     * Whether a datetime string states its own offset — a trailing `Z`, or a
     * `+hh:mm`/`-hh:mm` after the time. Such a value is already absolute.
     */
    protected function hasTimezoneOffset(string $value): bool
    {
        return (bool) preg_match('/(?:Z|[+-]\d{2}:?\d{2})$/i', $value);
    }
}
