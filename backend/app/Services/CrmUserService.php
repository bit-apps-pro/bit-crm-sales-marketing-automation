<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Config;
use BitApps\Crm\Constants\HookKeys;

class CrmUserService
{
    public const HAS_CRM_CAPABILITIES_META_KEY = 'has_' . Config::VAR_PREFIX . 'capabilities';

    public const CAPABILITY_SLUG_OTHERS = 'others';

    public const ESSENTIAL_CAPABILITIES = ['bit_crm_menu'];

    public function allPluginCapabilities()
    {
        static $capabilities = null;

        if (\is_null($capabilities)) {
            $capabilityOptions = $this->getCapabilityOptions();
            $capabilities = [];

            foreach ($capabilityOptions as $group) {
                foreach ($group as $capability) {
                    $capabilities[] = $capability['value'];
                }
            }

            $menuCapabilities = $this->generateMenuCapabilitiesByModule(array_keys($capabilityOptions));
            $capabilities = array_merge($capabilities, $menuCapabilities, $this::ESSENTIAL_CAPABILITIES);
        }

        return $capabilities;
    }

    public function getUserPluginCaps($user): array
    {
        if (is_numeric($user)) {
            $user = get_user_by('ID', $user);
        }

        if (!$user) {
            return [];
        }

        $userCaps = array_keys(array_filter($user->allcaps));

        return array_intersect($userCaps, $this->allPluginCapabilities());
    }

    public function getCapabilityOptions(): array
    {
        static $capabilityOptions = null;

        if (\is_null($capabilityOptions)) {
            $path = Config::get('BASEDIR') . '/app/src/StaticData/capabilityOptions.php';
            $capabilityOptions = file_exists($path) ? include $path : [];
            $capabilityOptions = apply_filters(HookKeys::CAPABILITY_OPTIONS, $capabilityOptions);
        }

        return $capabilityOptions;
    }

    protected function generateMenuCapabilitiesByModule(array $modules): array
    {
        $menuCapabilities = [];

        foreach ($modules as $module) {
            if ($module === self::CAPABILITY_SLUG_OTHERS || $module === 'dashboard') {
                continue;
            }

            $menuCapabilities[] = Config::VAR_PREFIX . $module . '_menu';
        }

        return $menuCapabilities;
    }
}
