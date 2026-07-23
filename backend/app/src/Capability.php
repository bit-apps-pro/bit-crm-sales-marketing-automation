<?php

namespace BitApps\Crm\src;

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPKit\Utils\Capabilities;
use BitApps\Crm\Services\CrmUserService;
use BitApps\Crm\src\UserPermissions\Roles;
use WP_User;

final class Capability
{
    public static function getCapabilities()
    {
        if (!empty(Config::DEV_ROLE) && Config::getEnv('DEV')) {
            return self::getDevCapabilities();
        }

        $user = wp_get_current_user();

        if (!$user) {
            return [];
        }

        if (\in_array(Roles::ADMINISTRATOR, $user->roles)) {
            return [Roles::ADMINISTRATOR];
        }

        $crmUserHelper = new CrmUserService();
        $crmUserCaps = $crmUserHelper->getUserPluginCaps($user);
        $grantedPluginCaps = self::getGrantedPluginCapabilities($user);

        return array_values(array_unique(array_merge($crmUserCaps, $grantedPluginCaps)));
    }

    public static function check($capability)
    {
        $user = wp_get_current_user();

        if ($user && \in_array(Roles::ADMINISTRATOR, $user->roles)) {
            return true;
        }

        return Capabilities::check($capability);
    }

    private static function getDevCapabilities()
    {
        $role = get_role(Config::DEV_ROLE);
        $formattedCapabilities = [];

        if ($role && $capabilities = $role->capabilities) {
            foreach ($capabilities as $capability => $grant) {
                if (strpos($capability, 'bit_crm') === false || !$grant) {
                    continue;
                }

                $formattedCapabilities[] = $capability;
            }
        }

        return $formattedCapabilities;
    }

    private static function getGrantedPluginCapabilities(WP_User $user): array
    {
        $allCaps = \is_array($user->allcaps ?? null) ? $user->allcaps : [];
        $pluginCaps = [];

        foreach ($allCaps as $capability => $grant) {
            if (!$grant || strpos($capability, Config::VAR_PREFIX) !== 0) {
                continue;
            }

            $pluginCaps[] = $capability;
        }

        return $pluginCaps;
    }
}
