<?php

namespace BitApps\Crm\src\UserPermissions;

use BitApps\Crm\Constants\HookKeys;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;

class AdminCapabilities
{
    public static function all()
    {
        $adminCapabilities = Capabilities::generateCapabilitiesWithPrefix(['general_settings']);
        $imapSettingsMenu = Capabilities::generateCapabilitiesWithPrefix(['menu'], 'imap_settings');
        $imapSettingsCrud = Capabilities::generateCrudCapabilities('imap_settings');
        $otherCapabilities = Capabilities::generateCapabilitiesWithPrefix(['settings', 'export_read', 'export_delete', 'import_read', 'import_delete', 'trash_read', 'trash_delete', 'trash_restore'], 'data_management');
        $otherAdminCapabilities = Hooks::applyFilter(HookKeys::ADMIN_CAPABILITIES, []);

        return array_unique(
            array_merge(
                $adminCapabilities,
                LeadManagerCapabilities::all(),
                CompanyManagerCapabilities::all(),
                ContactManagerCapabilities::all(),
                DealManagerCapabilities::all(),
                InvoiceManagerCapabilities::all(),
                $imapSettingsMenu,
                $imapSettingsCrud,
                $otherCapabilities,
                $otherAdminCapabilities
            )
        );
    }
}
