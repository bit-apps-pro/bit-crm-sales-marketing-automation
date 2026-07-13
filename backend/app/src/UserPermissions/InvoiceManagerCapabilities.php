<?php

namespace BitApps\Crm\src\UserPermissions;

use BitApps\Crm\Model\Invoice;

class InvoiceManagerCapabilities
{
    public static function all()
    {
        $crudCapabilities = Capabilities::generateCrudCapabilities(Invoice::MODULE_NAME);
        $historyCapabilities = Capabilities::getHistoryCapabilities();
        $commonCapabilities = Capabilities::getCommonsCapabilities();
        $otherCapabilities = Capabilities::generateCapabilitiesWithPrefix(
            ['settings', 'menu', 'activity_log'],
            Invoice::MODULE_NAME
        );

        return array_merge($crudCapabilities, $historyCapabilities, $commonCapabilities, $otherCapabilities);
    }
}
