<?php

namespace BitApps\Crm\src;

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPKit\Utils\Capabilities;
use BitApps\Crm\Services\CrmUserService;
use BitApps\Crm\src\UserPermissions\Roles;

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

        return array_values($crmUserCaps);
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
}
