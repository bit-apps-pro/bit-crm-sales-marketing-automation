<?php

namespace BitApps\Crm\src\UserPermissions;

use BitApps\Crm\Model\Lead;

class LeadManagerCapabilities
{
    public static function all()
    {
        $crudCapabilities = Capabilities::generateCrudCapabilities(Lead::MODULE_NAME);
        $tagCapabilities = Capabilities::getTagCapabilities();
        $historyCapabilities = Capabilities::getHistoryCapabilities();
        $commonCapabilities = Capabilities::getCommonsCapabilities();
        $otherCapabilities = Capabilities::generateCapabilitiesWithPrefix(
            ['emails', 'settings', 'menu', 'export', 'import', 'activity_log'],
            Lead::MODULE_NAME
        );

        return array_merge($crudCapabilities, $tagCapabilities, $historyCapabilities, $commonCapabilities, $otherCapabilities);
    }
}
