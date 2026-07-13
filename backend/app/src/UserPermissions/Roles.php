<?php

namespace BitApps\Crm\src\UserPermissions;

use BitApps\Crm\Constants\HookKeys;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;

class Roles
{
    public const ADMINISTRATOR = 'administrator';

    public const BIT_CRM_ADMIN = 'bit_crm_admin';

    public const BIT_CRM_LEAD_MANAGER = 'bit_crm_lead_manager';

    public const BIT_CRM_CONTACT_MANAGER = 'bit_crm_contact_manager';

    public const BIT_CRM_COMPANY_MANAGER = 'bit_crm_company_manager';

    public const BIT_CRM_INVOICE_MANAGER = 'bit_crm_invoice_manager';

    public static function init()
    {
        self::addCapabilitiesToAdministrator();
        self::addRoles();
    }

    public static function flush()
    {
        self::removeCapabilitiesFromAdministrator();
        self::removeRoles();
    }

    public static function all()
    {
        $roles = [
            [
                'name'         => self::BIT_CRM_ADMIN,
                'display_name' => __('Bit CRM Admin', 'bit-crm'),
                'capabilities' => AdminCapabilities::all()
            ],
            [
                'name'         => self::BIT_CRM_LEAD_MANAGER,
                'display_name' => __('Bit CRM Lead Manager', 'bit-crm'),
                'capabilities' => LeadManagerCapabilities::all()
            ],
            [
                'name'         => self::BIT_CRM_CONTACT_MANAGER,
                'display_name' => __('Bit CRM Contact Manager', 'bit-crm'),
                'capabilities' => ContactManagerCapabilities::all()
            ],
            [
                'name'         => self::BIT_CRM_COMPANY_MANAGER,
                'display_name' => __('Bit CRM Company Manager', 'bit-crm'),
                'capabilities' => CompanyManagerCapabilities::all()
            ],
            [
                'name'         => self::BIT_CRM_INVOICE_MANAGER,
                'display_name' => __('Bit CRM Invoice Manager', 'bit-crm'),
                'capabilities' => InvoiceManagerCapabilities::all()
            ],
        ];

        return Hooks::applyFilter(HookKeys::ADDITIONAL_ROLES, $roles);
    }

    public static function getRoleNames(bool $includeAdministrator = false): array
    {
        $roles = self::all();

        $rolesName = array_map(
            function ($role) {
                return $role['name'];
            },
            $roles
        );

        if ($includeAdministrator) {
            $rolesName[] = self::ADMINISTRATOR;
        }

        return $rolesName;
    }

    private static function addRoles()
    {
        $roles = self::all();

        foreach ($roles as $role) {
            add_role($role['name'], $role['display_name'], []);

            self::addCapabilities($role['name'], $role['capabilities']);
        }
    }

    private static function removeRoles()
    {
        $roles = self::all();

        foreach ($roles as $role) {
            remove_role($role['name']);
        }
    }

    private static function addCapabilitiesToAdministrator()
    {
        $capabilities = AdminCapabilities::all();

        self::addCapabilities(self::ADMINISTRATOR, $capabilities);
    }

    private static function removeCapabilitiesFromAdministrator()
    {
        // Make sure to filter WordPress common capabilities before removing custom capabilities from administrator

        $capabilities = array_diff(AdminCapabilities::all(), Capabilities::WP_COMMON_CAPABILITIES);

        self::removeCapabilities(self::ADMINISTRATOR, $capabilities);
    }

    private static function addCapabilities(string $roleName, array $capabilities)
    {
        $role = get_role($roleName);

        if (!$role) {
            return;
        }

        foreach ($capabilities as $capability) {
            $role->add_cap($capability);
        }
    }

    private static function removeCapabilities(string $roleName, array $capabilities)
    {
        $role = get_role($roleName);

        if (!$role) {
            return;
        }

        foreach ($capabilities as $capability) {
            $role->remove_cap($capability);
        }
    }
}
