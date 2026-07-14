<?php

namespace BitApps\Crm\HTTP\Controllers;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Response;
use BitApps\Crm\HTTP\Requests\InvoiceTerm\DeleteRequest;
use BitApps\Crm\HTTP\Requests\InvoiceTerm\IndexRequest;
use BitApps\Crm\HTTP\Requests\InvoiceTerm\OptionsRequest;
use BitApps\Crm\HTTP\Requests\InvoiceTerm\ShowRequest;
use BitApps\Crm\HTTP\Requests\InvoiceTerm\UpsertRequest;
use BitApps\Crm\Model\Invoice;
use BitApps\Crm\Services\InvoiceTermService;

final class InvoiceTermController
{
    private const DEFAULT_PAGE = 1;

    private const DEFAULT_PER_PAGE = 10;

    private InvoiceTermService $invoiceTermService;

    public function __construct()
    {
        $this->invoiceTermService = new InvoiceTermService();
    }

    public function index(IndexRequest $request)
    {
        $validated = $request->validated();
        $page = $validated['page'] ?? self::DEFAULT_PAGE;
        $perPage = $validated['perPage'] ?? self::DEFAULT_PER_PAGE;

        $terms = $this->invoiceTermService->getPaginatedTerms($page, $perPage);

        return Response::success($terms)->message(__('Invoice terms retrieved successfully.', 'bit-crm-sales-marketing-automation'));
    }

    public function show(ShowRequest $request)
    {
        $validated = $request->validated();
        $key = $validated['key'];

        $terms = $this->invoiceTermService->getAllTerms();

        $term = $terms[$key] ?? null;

        if (empty($term)) {
            return Response::error(null)->message(__('Invoice term not found.', 'bit-crm-sales-marketing-automation'));
        }

        return Response::success($term)->message(__('Invoice term retrieved successfully.', 'bit-crm-sales-marketing-automation'));
    }

    public function store(UpsertRequest $request)
    {
        $validated = $request->validated();

        $terms = $this->invoiceTermService->getAllTerms();

        if (\array_key_exists($validated['key'], $terms)) {
            return Response::error(null)->message(__('Term with the given key already exists.', 'bit-crm-sales-marketing-automation'));
        }

        foreach ($terms as $existingTerm) {
            if (strtolower($existingTerm['name']) === strtolower($validated['name'])) {
                return Response::error(null)->message(__('A term with this name already exists.', 'bit-crm-sales-marketing-automation'));
            }
        }

        $terms[$validated['key']] = $validated;

        if ($this->invoiceTermService->upsertTerms($terms)) {
            return Response::success(null)->message(__('Invoice term created successfully.', 'bit-crm-sales-marketing-automation'));
        }

        return Response::error(null)->message(__('Failed to create invoice term.', 'bit-crm-sales-marketing-automation'));
    }

    public function update(UpsertRequest $request)
    {
        $validated = $request->validated();

        $terms = $this->invoiceTermService->getAllTerms();

        if (!\array_key_exists($validated['key'], $terms)) {
            return Response::error([])->message(__('Term with the given key does not exist.', 'bit-crm-sales-marketing-automation'));
        }

        if ($validated['key'] === 'custom') {
            return Response::error([])->message(__('Cannot update system defined term.', 'bit-crm-sales-marketing-automation'));
        }

        if (Invoice::findOne(['term_key' => $validated['key']])) {
            return Response::error([])->message(__('Cannot update term assigned to existing invoices.', 'bit-crm-sales-marketing-automation'));
        }

        foreach ($terms as $termKey => $existingTerm) {
            if ($termKey !== $validated['key'] && strtolower($existingTerm['name']) === strtolower($validated['name'])) {
                $message = __('A term with this name already exists.', 'bit-crm-sales-marketing-automation');

                return Response::error(['name' => [$message]])->message($message);
            }
        }

        $terms[$validated['key']] = $validated;

        if ($this->invoiceTermService->upsertTerms($terms)) {
            return Response::success([])->message(__('Invoice term updated successfully.', 'bit-crm-sales-marketing-automation'));
        }

        return Response::error([])->message(__('Failed to update invoice term.', 'bit-crm-sales-marketing-automation'));
    }

    public function delete(DeleteRequest $request)
    {
        $validated = $request->validated();

        $terms = $this->invoiceTermService->getAllTerms();

        if (!\array_key_exists($validated['key'], $terms)) {
            return Response::error([])->message(__('Term with the given key does not exist.', 'bit-crm-sales-marketing-automation'));
        }

        if ($validated['key'] === 'custom') {
            return Response::error([])->message(__('Cannot delete system defined term.', 'bit-crm-sales-marketing-automation'));
        }

        if (Invoice::findOne(['term_key' => $validated['key']])) {
            return Response::error([])->message(__('Cannot delete term assigned to existing invoices.', 'bit-crm-sales-marketing-automation'));
        }

        unset($terms[$validated['key']]);

        if ($this->invoiceTermService->upsertTerms($terms)) {
            return Response::success([])->message(__('Invoice term deleted successfully.', 'bit-crm-sales-marketing-automation'));
        }

        return Response::error([])->message(__('Failed to delete invoice term.', 'bit-crm-sales-marketing-automation'));
    }

    public function options(OptionsRequest $request)
    {
        $termsOptions = $this->invoiceTermService->getTermsAsOptions();

        return Response::success($termsOptions)->message(__('Invoice terms options retrieved successfully.', 'bit-crm-sales-marketing-automation'));
    }
}
