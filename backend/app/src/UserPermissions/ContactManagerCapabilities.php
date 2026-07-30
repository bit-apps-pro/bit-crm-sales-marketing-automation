<?php

namespace BitApps\Crm\src\UserPermissions;

class ContactManagerCapabilities
{
    public static function all()
    {
        $crudCapabilities = Capabilities::generateCrudCapabilities('contact');
        $tagCapabilities = Capabilities::getTagCapabilities();
        $historyCapabilities = Capabilities::getHistoryCapabilities();
        $commonCapabilities = Capabilities::getCommonsCapabilities();
        $activityRelatedCapabilities = Capabilities::getActivityRelatedCapabilities();
        $otherCapabilities = Capabilities::generateCapabilitiesWithPrefix(
            ['emails', 'settings', 'menu', 'export', 'import', 'activity_log'],
            'contact'
        );

        return array_merge($crudCapabilities, $tagCapabilities, $historyCapabilities, $commonCapabilities, $activityRelatedCapabilities, $otherCapabilities);
    }
}
