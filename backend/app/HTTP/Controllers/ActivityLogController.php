<?php

namespace BitApps\Crm\HTTP\Controllers;

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPKit\Http\Response;
use BitApps\Crm\HTTP\Requests\ActivityLog\IndexRequest;
use BitApps\Crm\Model\ActivityLog;
use BitApps\Crm\Services\ActivityLogService;

final class ActivityLogController
{
    private ActivityLogService $activityLogService;

    public function __construct()
    {
        $this->activityLogService = new ActivityLogService();
    }

    public function index(IndexRequest $request)
    {
        $validated = $request->validated();
        $wpUsersTable = Config::get('WP_DB_PREFIX') . 'users';

        $activityLogs = ActivityLog::select(['id', 'event', 'title', 'entity_id', 'created_by', 'updated_by', 'module', 'details', 'created_at'])
            ->selectRaw("(SELECT display_name FROM {$wpUsersTable} WHERE ID = created_by) AS created_by_name")
            ->where('module', $validated['module'])
            ->where('entity_id', $validated['entity_id'])
            ->orderBy('created_at')
            ->desc()
            ->get();

        $formattedActivityLogs = $this->activityLogService->formatData($activityLogs);

        return Response::success($formattedActivityLogs);
    }
}
