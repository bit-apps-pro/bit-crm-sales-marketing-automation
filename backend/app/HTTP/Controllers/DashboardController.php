<?php

namespace BitApps\Crm\HTTP\Controllers;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Response;
use BitApps\Crm\HTTP\Requests\Dashboard\IndexRequest;
use BitApps\Crm\Services\DashboardService;

final class DashboardController
{
    private DashboardService $dashboardService;

    public function __construct()
    {
        $this->dashboardService = new DashboardService();
    }

    public function index(IndexRequest $request)
    {
        $validated = $request->validated();
        $startDate = $validated['startDate'] ?? null;
        $endDate = $validated['endDate'] ?? null;

        if (empty($startDate) || empty($endDate) || $startDate > $endDate) {
            $startDate = current_time('Y-m-01');
            $endDate = current_time('Y-m-d');
        }

        return Response::success(
            [
                'userName'              => wp_get_current_user()->display_name,
                'pendingActivities'     => $this->dashboardService->getPendingActivities(),
                'leadCountBySource'     => $this->dashboardService->getLeadCountBySource(),
                'invoiceStatusOverview' => $this->dashboardService->getInvoiceStatusOverview(),
                'dealsPipeline'         => $this->dashboardService->getDealPipeline($startDate, $endDate),
                'stats'                 => $this->dashboardService->getStats(),
            ]
        );
    }
}
