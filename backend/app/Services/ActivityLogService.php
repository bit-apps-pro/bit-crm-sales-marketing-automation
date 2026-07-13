<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Deps\BitApps\WPDatabase\Collection;

class ActivityLogService
{
    public function formatData(array|Collection $data)
    {
        if (empty($data)) {
            return $data;
        }

        foreach ($data as $log) {
            $log->details = str_replace('{created_by_name}', $log->created_by_name ?? 'Unknown', $log->details);
        }

        return $data;
    }
}
