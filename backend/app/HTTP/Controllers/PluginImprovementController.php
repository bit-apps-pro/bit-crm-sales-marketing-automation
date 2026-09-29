<?php

namespace BitApps\Crm\HTTP\Controllers;

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPKit\Http\Response;
use BitApps\Crm\Deps\BitApps\WPTelemetry\Telemetry\Telemetry;
use BitApps\Crm\HTTP\Requests\PluginImprovement\ShowRequest;
use BitApps\Crm\HTTP\Requests\PluginImprovement\UpdateRequest;

final class PluginImprovementController
{
    public function getOpt(ShowRequest $request)
    {
        return Response::success([
            'allowTracking' => (bool) Config::getOption('allow_tracking', false),
        ]);
    }

    public function updateOpt(UpdateRequest $request)
    {
        $validatedData = $request->validated();

        if ($validatedData['allowTracking']) {
            Telemetry::report()->trackingOptIn();
        } else {
            Telemetry::report()->trackingOptOut();
        }

        return Response::success([
            'allowTracking' => (bool) $validatedData['allowTracking'],
        ]);
    }
}
