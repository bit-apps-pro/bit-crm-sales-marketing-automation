<?php

namespace BitApps\Crm\src\UserPermissions;

use BitApps\Crm\Model\Deal;

class DealManagerCapabilities
{
    public static function all()
    {
        $crudCapabilities = Capabilities::generateCrudCapabilities(Deal::MODULE_NAME);
        $tagCapabilities = Capabilities::getTagCapabilities();
        $historyCapabilities = Capabilities::getHistoryCapabilities();
        $commonCapabilities = Capabilities::getCommonsCapabilities();
        $otherCapabilities = Capabilities::generateCapabilitiesWithPrefix(
            ['emails', 'settings', 'menu', 'export', 'import', 'activity_log'],
            Deal::MODULE_NAME
        );

        return array_merge($crudCapabilities, $tagCapabilities, $historyCapabilities, $commonCapabilities, $otherCapabilities);
    }
}
