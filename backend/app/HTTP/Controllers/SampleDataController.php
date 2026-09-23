<?php

namespace BitApps\Crm\HTTP\Controllers;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Response;
use BitApps\Crm\HTTP\Requests\SampleData\SampleDataRequest;
use BitApps\Crm\Services\SampleDataService;
use BitApps\Crm\Utils\Logger;
use Throwable;

final class SampleDataController
{
    /**
     * Accepts the one-time offer. Only valid while no decision has been made.
     */
    public function seed(SampleDataRequest $request)
    {
        $request->validated();

        $service = new SampleDataService();

        if (!$service->isPending()) {
            return Response::error(__('Sample data can only be added once.', 'bit-crm-sales-marketing-automation'));
        }

        try {
            $service->seed();
        } catch (Throwable $th) {
            Logger::error($th);

            return Response::error(__('Failed to add sample data.', 'bit-crm-sales-marketing-automation'));
        }

        return Response::success(null)->message(__('Sample data added successfully.', 'bit-crm-sales-marketing-automation'));
    }

    /**
     * Declines the offer for good; it is never shown again.
     */
    public function dismiss(SampleDataRequest $request)
    {
        $request->validated();

        (new SampleDataService())->dismiss();

        return Response::success(null);
    }

    public function remove(SampleDataRequest $request)
    {
        $request->validated();

        $service = new SampleDataService();

        if (!$service->exists()) {
            return Response::error(__('There is no sample data to remove.', 'bit-crm-sales-marketing-automation'));
        }

        try {
            $service->remove();
        } catch (Throwable $th) {
            Logger::error($th);

            return Response::error(__('Failed to remove sample data.', 'bit-crm-sales-marketing-automation'));
        }

        return Response::success(null)->message(__('Sample data removed successfully.', 'bit-crm-sales-marketing-automation'));
    }
}
