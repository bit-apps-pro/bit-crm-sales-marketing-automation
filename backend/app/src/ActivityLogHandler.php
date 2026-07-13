<?php

namespace BitApps\Crm\src;

use BitApps\Crm\Model\ActivityLog;

class ActivityLogHandler
{
    public const CREATED = 'created';

    public const UPDATED = 'updated';

    public const DELETED = 'deleted';

    public static function addLog(string $event, int $entityId, string $module, ?string $title = null, ?string $details = null)
    {
        if (!self::validateEvent($event) || empty($entityId) || empty($module)) {
            return false;
        }

        if (empty($details)) {
            $details = self::generateDetails($event, $module);
        }

        return ActivityLog::insert(
            [
                'event'      => $event,
                'title'      => $title ?? $event,
                'entity_id'  => (int) $entityId,
                'created_by' => get_current_user_id(),
                'module'     => $module,
                'details'    => $details,
            ]
        );
    }

    private static function validateEvent(string $event)
    {
        return \in_array($event, [self::CREATED, self::UPDATED, self::DELETED]);
    }

    /**
     * Generate details message for activity log based on event and module.
     *
     * @param string $event  the event type (created, updated, deleted)
     * @param string $module The module name (e.g., lead, contact).
     *
     * @return string the generated details message
     */
    private static function generateDetails(string $event, string $module)
    {
        return ucfirst(str_replace('_', ' ', $module)) . ' ' . $event . ' by {created_by_name}';
    }
}
