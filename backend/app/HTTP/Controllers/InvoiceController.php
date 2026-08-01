<?php

namespace BitApps\Crm\HTTP\Controllers;

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPDatabase\Connection;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Deps\BitApps\WPKit\Http\Response;
use BitApps\Crm\Helpers\File;
use BitApps\Crm\Helpers\FileHandler;
use BitApps\Crm\HTTP\Requests\Invoice\DownloadRequest;
use BitApps\Crm\HTTP\Requests\Invoice\IndexRequest;
use BitApps\Crm\HTTP\Requests\Invoice\InvoiceByDealRequest;
use BitApps\Crm\HTTP\Requests\Invoice\PrefixRequest;
use BitApps\Crm\HTTP\Requests\Invoice\SendInvoiceRequest;
use BitApps\Crm\HTTP\Requests\Invoice\ShowRequest;
use BitApps\Crm\HTTP\Requests\Invoice\StoreRequest;
use BitApps\Crm\HTTP\Requests\Invoice\TrashRequest;
use BitApps\Crm\HTTP\Requests\Invoice\UpdateRequest;
use BitApps\Crm\HTTP\Requests\Invoice\UpdateStatusRequest;
use BitApps\Crm\Model\Deal;
use BitApps\Crm\Model\Invoice;
use BitApps\Crm\Model\LineItem;
use BitApps\Crm\Model\Setting;
use BitApps\Crm\Model\Trash;
use BitApps\Crm\Services\InvoicePdfService;
use BitApps\Crm\Services\InvoiceService;
use BitApps\Crm\Services\InvoiceShareTokenService;
use BitApps\Crm\Services\LineItemService;
use Throwable;

final class InvoiceController
{
    private const DEFAULT_PAGE = 1;

    private const DEFAULT_PER_PAGE = 10;

    private const SETTING_KEY = Setting::BUSINESS_SETTINGS_KEY;

    private const SORTABLE_COLUMNS = ['id', 'status', 'amount', 'invoice_date', 'due_date', 'paid_at', 'created_at', 'updated_at'];

    private const TEMP_DIR = '/bit_crm/temp';

    public function store(StoreRequest $request)
    {
        $validated = $request->validated();
        $lineItems = $validated['line_items'] ?? [];
        unset($validated['line_items']);

        $validated['created_by'] = get_current_user_id();

        $dealCurrency = $validated['currency'] ?? null;
        $taxOption = $validated['tax_option'] ?? LineItem::TAX_EXCLUSIVE;

        $amounts = InvoiceService::resolveInvoiceAmounts(
            $lineItems,
            $dealCurrency,
            $taxOption,
            (float) ($validated['gross_discount_amount'] ?? 0),
            $validated['gross_discount_type'] ?? 'amount'
        );
        $validated['amount'] = $amounts['amount'];
        $validated['home_currency_amount'] = $amounts['home_currency_amount'];

        Connection::startTransaction();

        try {
            $storedInvoice = Invoice::insert($validated);

            if (!empty($lineItems)) {
                $lineItemsService = new LineItemService($storedInvoice->id, Invoice::MODULE_NAME);
                $lineItemsService->syncLineItems($lineItems, $dealCurrency, $taxOption);
            }

            Connection::commit();

            Hooks::doAction('bit_crm/invoice_created', $storedInvoice);

            return Response::success(['id' => $storedInvoice->id])->message(__('Invoice created successfully', 'bit-crm-sales-marketing-automation'));
        } catch (Throwable $th) {
            Connection::rollBack();

            return Response::error(null)->message(__('Failed to create new invoice!', 'bit-crm-sales-marketing-automation'));
        }
    }

    public function update(UpdateRequest $request)
    {
        $validated = $request->validated();
        $lineItems = $validated['line_items'] ?? [];
        unset($validated['line_items']);

        $invoice = Invoice::findOne(['id' => $validated['id']]);

        if (empty($invoice)) {
            return Response::error(null)->message(__('Invoice not found!', 'bit-crm-sales-marketing-automation'));
        }

        if ($invoice->status === Invoice::STATUS_PAID || $invoice->status === Invoice::STATUS_PARTIALLY_PAID) {
            return Response::error(null)->message(__('Cannot update an invoice that already has payments!', 'bit-crm-sales-marketing-automation'));
        }

        if (isset($validated['status'])) {
            if (!Invoice::canTransitionStatus($invoice->status, $validated['status'])) {
                return Response::error(null)->message(__('Invalid status transition!', 'bit-crm-sales-marketing-automation'));
            }

            if ($validated['status'] === Invoice::STATUS_PAID) {
                $validated['paid_at'] = current_time('mysql', true);
            }
        }

        Connection::startTransaction();

        try {
            $validated['updated_by'] = get_current_user_id();

            if (
                ($invoice->status === Invoice::STATUS_SENT || $invoice->status === Invoice::STATUS_OVERDUE)
                && ($validated['status'] ?? null) !== Invoice::STATUS_PAID
            ) {
                $effectiveDueDate = $validated['due_date'] ?? $invoice->due_date;

                if (!empty($effectiveDueDate)) {
                    $today = current_time('Y-m-d');
                    $dueDay = substr((string) $effectiveDueDate, 0, 10);
                    $validated['status'] = $dueDay < $today ? Invoice::STATUS_OVERDUE : Invoice::STATUS_SENT;
                }
            }

            $dealCurrency = $validated['currency'];
            $taxOption = $validated['tax_option'];

            $amounts = InvoiceService::resolveInvoiceAmounts(
                $lineItems,
                $dealCurrency,
                $taxOption,
                (float) ($validated['gross_discount_amount'] ?? 0),
                $validated['gross_discount_type'] ?? 'amount'
            );
            $validated['amount'] = $amounts['amount'];
            $validated['home_currency_amount'] = $amounts['home_currency_amount'];

            $invoice->update($validated);

            $lineItemsService = new LineItemService($invoice->id, Invoice::MODULE_NAME);
            $lineItemsService->syncLineItems($lineItems, $dealCurrency, $taxOption);

            Connection::commit();

            Hooks::doAction('bit_crm/invoice_updated', $invoice);

            return Response::success(null)->message(__('Invoice updated successfully', 'bit-crm-sales-marketing-automation'));
        } catch (Throwable $th) {
            Connection::rollBack();

            return Response::error(null)->message(__('Failed to update invoice!', 'bit-crm-sales-marketing-automation'));
        }
    }

    public function updateStatus(UpdateStatusRequest $request)
    {
        $validated = $request->validated();

        $invoice = Invoice::findOne(['id' => $validated['id']]);

        if (empty($invoice)) {
            return Response::error(__('Invoice not found!', 'bit-crm-sales-marketing-automation'));
        }

        if ($invoice->status === Invoice::STATUS_PAID) {
            return Response::error(__('Cannot change status of a paid invoice!', 'bit-crm-sales-marketing-automation'));
        }

        if (!Invoice::canTransitionStatus($invoice->status, $validated['status'])) {
            return Response::error(__('Invalid status transition!', 'bit-crm-sales-marketing-automation'));
        }

        $updateData = [
            'status'     => $validated['status'],
            'updated_by' => get_current_user_id(),
        ];

        if ($validated['status'] === Invoice::STATUS_PAID) {
            $updateData['paid_at'] = current_time('mysql', true);
        }

        if ($validated['status'] === Invoice::STATUS_SENT) {
            $updateData['sent_at'] = current_time('mysql', true);
        }

        try {
            $invoice->update($updateData);

            Hooks::doAction('bit_crm/invoice_status_updated', $invoice);

            return Response::success(__('Invoice status updated successfully', 'bit-crm-sales-marketing-automation'));
        } catch (Throwable $th) {
            return Response::error(__('Failed to update invoice status!', 'bit-crm-sales-marketing-automation'));
        }
    }

    public function index(IndexRequest $request)
    {
        $validated = $request->validated();
        $sortBy = $validated['sortBy'] ?: 'id';
        $sortOrder = $validated['sortOrder'] ?: 'desc';
        $page = $validated['page'] ?? self::DEFAULT_PAGE;
        $perPage = $validated['perPage'] ?? self::DEFAULT_PER_PAGE;
        $statuses = array_filter(explode(',', $validated['statuses'] ?? ''));
        $statuses = array_values(array_intersect($statuses, Invoice::VALID_STATUSES));

        $invoicesQuery = $this->buildInvoiceListingQuery($sortBy, $sortOrder)
            ->when(
                !empty($statuses),
                function ($invoicesQuery) use ($statuses) {
                    return $invoicesQuery->whereIn('status', $statuses);
                }
            );

        $invoices = $invoicesQuery->paginate($page, $perPage);

        return Response::success($invoices);
    }

    public function show(ShowRequest $request)
    {
        $validated = $request->validated();

        $details = InvoiceService::getInvoiceDetails((int) $validated['id']);

        if ($details === null) {
            return Response::error(__('Invoice not found!', 'bit-crm-sales-marketing-automation'));
        }

        return Response::success($details);
    }

    public function trash(TrashRequest $request)
    {
        $validated = $request->validated();

        $invoices = Invoice::whereIn('id', $validated['ids'])->get();
        $invoicesData = $invoices->toArray();


        if (!\count($invoicesData)) {
            return Response::error(__('No invoices found to trash!', 'bit-crm-sales-marketing-automation'));
        }

        $currentUserId = get_current_user_id();

        $trashData = array_map(
            fn ($invoice) => [
                'entity_id'  => $invoice['id'],
                'module'     => Invoice::MODULE_NAME,
                'created_by' => $currentUserId,
                'full_name'  => $invoice['invoice_prefix'] . '-' . $invoice['id'],
            ],
            $invoicesData
        );

        Connection::startTransaction();

        try {
            Invoice::whereIn('id', $validated['ids'])->update(['is_trash' => true]);
            Trash::insert($trashData);

            Connection::commit();

            Hooks::doAction('bit_crm/invoices_trashed', $validated['ids']);

            return Response::success([])->message(__('Invoices trashed successfully', 'bit-crm-sales-marketing-automation'));
        } catch (Throwable $th) {
            Connection::rollBack();

            return Response::error(__('Failed to trash invoices!', 'bit-crm-sales-marketing-automation'));
        }
    }

    public function download(DownloadRequest $request)
    {
        $validated = $request->validated();

        $invoice = Invoice::findOne(['id' => $validated['id']]);

        if (empty($invoice)) {
            return Response::error(__('Invoice not found!', 'bit-crm-sales-marketing-automation'));
        }

        try {
            $invoicePdfService = new InvoicePdfService();
            $mpdf = $invoicePdfService->generate($validated['id']);
            $fileName = InvoiceService::generateInvoiceFileName($invoice->invoice_prefix, (int) $invoice->id);
            $mpdf->Output($fileName, 'D');

            exit();
        } catch (Throwable $th) {
            return Response::error(__('Failed to generate invoice PDF!', 'bit-crm-sales-marketing-automation'));
        }
    }

    public function sendInvoice(SendInvoiceRequest $request)
    {
        $validated = $request->validated();

        $invoice = Invoice::findOne(['id' => $validated['id']]);

        if (empty($invoice)) {
            return Response::error(__('Invoice not found!', 'bit-crm-sales-marketing-automation'));
        }

        $deal = $invoice->module === Deal::MODULE_NAME
            ? Deal::select(['id', 'name', 'email'])->findOne(['id' => $invoice->entity_id])
            : null;

        if (empty($deal) || empty($deal['email'])) {
            return Response::error(__('Deal email address not found!', 'bit-crm-sales-marketing-automation'));
        }

        $tempDir = null;
        $tempFile = null;
        $emailSent = false;

        try {
            $invoicePdfService = new InvoicePdfService();
            $mpdf = $invoicePdfService->generate($validated['id']);

            $invoiceFileName = InvoiceService::generateInvoiceFileName($invoice->invoice_prefix, (int) $invoice->id);

            $tempDir = Config::get('UPLOAD_BASE_DIR') . self::TEMP_DIR . '/' . uniqid('', true);
            wp_mkdir_p($tempDir);

            $tempFile = $tempDir . '/' . $invoiceFileName;
            $mpdf->Output($tempFile, 'F');

            $shareUrl = (new InvoiceShareTokenService())->getPublicInvoiceUrl($invoice);

            $emailSent = InvoiceService::sendInvoice($deal['email'], (int) $deal['id'], [$tempFile], $shareUrl);
        } catch (Throwable $th) {
            return Response::error(__('Failed to send invoice!', 'bit-crm-sales-marketing-automation'));
        } finally {
            if ($tempFile !== null && FileHandler::isValidPath($tempFile)) {
                wp_delete_file($tempFile);
            }
            if ($tempDir !== null && is_dir($tempDir)) {
                File::removeDirectory($tempDir);
            }
        }

        if (!$emailSent) {
            return Response::error(__('Failed to send invoice email!', 'bit-crm-sales-marketing-automation'));
        }

        try {
            InvoiceService::publishInvoice($invoice, true);
        } catch (Throwable $th) {
            return Response::success(__('Invoice sent, but status could not be updated. Please refresh.', 'bit-crm-sales-marketing-automation'));
        }

        return Response::success(__('Invoice sent successfully', 'bit-crm-sales-marketing-automation'));
    }

    public function invoicePrefix(PrefixRequest $request)
    {
        $setting = Setting::findOne(['setting_key' => Invoice::SETTINGS_KEYS['PREFIX']]);
        if (empty($setting)) {
            return Response::error(__('Invoice prefix setting not found!', 'bit-crm-sales-marketing-automation'));
        }

        return Response::success($setting->setting_value ?? '');
    }

    public function invoicesByDeal(InvoiceByDealRequest $request)
    {
        $validated = $request->validated();
        $dealId = $validated['id'];
        $sortBy = $validated['sortBy'] ?: 'id';
        $sortOrder = $validated['sortOrder'] ?: 'desc';
        $page = $validated['page'] ?? self::DEFAULT_PAGE;
        $perPage = $validated['perPage'] ?? self::DEFAULT_PER_PAGE;

        $invoicesQuery = $this->buildInvoiceListingQuery($sortBy, $sortOrder)
            ->where('module', Deal::MODULE_NAME)
            ->where('entity_id', $dealId);

        $invoices = $invoicesQuery->paginate($page, $perPage);

        return Response::success($invoices);
    }

    private function buildInvoiceListingQuery(string $sortBy, string $sortOrder)
    {
        $dealTable = Config::withDBPrefix('deals');
        $invoiceTable = Config::withDBPrefix('invoices');
        $sortBy = \in_array($sortBy, self::SORTABLE_COLUMNS, true) ? $sortBy : 'id';
        $direction = $sortOrder === 'asc' ? 'asc' : 'desc';

        return Invoice::select('*')
            ->where('is_trash', false)
            ->when(
                $sortBy === 'amount',
                fn ($query) => $query->orderByRaw(
                    "CAST(COALESCE(NULLIF({$invoiceTable}.home_currency_amount, ''), {$invoiceTable}.amount, '0') AS DECIMAL(26, 4)) "
                    . ($direction === 'asc' ? 'ASC' : 'DESC')
                ),
                fn ($query) => $query->when(
                    $direction === 'asc',
                    fn ($sorted) => $sorted->orderBy("{$invoiceTable}.{$sortBy}")->asc(),
                    fn ($sorted) => $sorted->orderBy("{$invoiceTable}.{$sortBy}")->desc()
                )
            )
            ->selectRaw("{$dealTable}.name AS deal_name")
            ->where("{$invoiceTable}.module", Deal::MODULE_NAME)
            ->leftJoin('deals', "{$invoiceTable}.entity_id", '=', "{$dealTable}.id");
    }
}
