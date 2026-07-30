<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Deps\BitApps\WPDatabase\Collection;
use BitApps\Crm\Deps\BitApps\WPDatabase\Connection;
use BitApps\Crm\Model\ActivityLog;
use BitApps\Crm\Model\Setting;
use BitApps\Crm\Utils\Logger;
use Throwable;

class ActivityLogService
{
    public const DEFAULT_PRESERVE_DAYS = 30;

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

    public static function activityLogCleanup()
    {
        try {
            $activityLogSettings = Setting::findOne(['setting_key' => 'activity_log']);

            $preserveActivityLogs = $activityLogSettings['setting_value']['preserve_logs'] ?? self::DEFAULT_PRESERVE_DAYS;

            if ($preserveActivityLogs <= 0) {
                return false;
            }
        } catch (Throwable $th) {
            Logger::error($th);

            return false;
        }

        Connection::startTransaction();

        try {
            ActivityLog::where('created_at', '<', gmdate('Y-m-d H:i:s', strtotime("-{$preserveActivityLogs} days")))->delete();

            Connection::commit();

            return true;
        } catch (Throwable $th) {
            Connection::rollback();

            Logger::error($th);

            return false;
        }
    }
}
