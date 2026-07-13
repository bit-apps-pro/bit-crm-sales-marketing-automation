<?php

namespace BitApps\Crm\src\UserPermissions;

use BitApps\Crm\Config;

class Capabilities
{
    public const WP_COMMON_CAPABILITIES = ['read'];

    public const ESSENTIAL_CAPABILITIES = ['bit_crm_menu'];

    /**
     * Generate capabilities with prefix.
     *
     * @param array       $capabilities list of capabilities
     * @param null|string $module       the module name to generate capabilities for
     *
     * @return array [ 'bit_crm_module_capability_1', 'bit_crm_module_capability_2', ... ]
     */
    public static function generateCapabilitiesWithPrefix(array $capabilities, ?string $module = null): array
    {
        return array_map(
            function ($capability) use ($module) {
                return Config::VAR_PREFIX . (isset($module) ? strtolower($module) . '_' : '') . strtolower($capability);
            },
            $capabilities
        );
    }

    /**
     * Generate CRUD capabilities.
     *
     * @param string $module the moudle name to generate capabilities for
     *
     * @return array [ 'bit_crm_module_create', 'bit_crm_module_read', 'bit_crm_module_update', 'bit_crm_module_delete' ]
     */
    public static function generateCrudCapabilities(string $module): array
    {
        $capabilities = ['create', 'read', 'update', 'delete'];

        return self::generateCapabilitiesWithPrefix($capabilities, $module);
    }

    /**
     * Get tag capabilities.
     *
     * @return array
     */
    public static function getTagCapabilities()
    {
        $crudCapabilities = self::generateCrudCapabilities('tag');
        $otherCapabilities = self::generateCapabilitiesWithPrefix(['menu'], 'tag');

        return array_merge($crudCapabilities, $otherCapabilities);
    }

    /**
     * Get history capabilities.
     *
     * @return array
     */
    public static function getHistoryCapabilities()
    {
        return self::generateCapabilitiesWithPrefix(['menu', 'read'], 'history');
    }

    /**
     * Get common capabilities.
     *
     * @return array [ 'bit_crm_dashboard', 'bit_crm_settings_menu', ... ]
     */
    public static function getCommonsCapabilities()
    {
        $capabilities = ['dashboard', 'settings_menu'];

        $generatedCommons = self::generateCapabilitiesWithPrefix($capabilities);

        return array_merge($generatedCommons, self::WP_COMMON_CAPABILITIES);
    }
}
