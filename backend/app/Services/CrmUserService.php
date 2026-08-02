<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Config;
use BitApps\Crm\Constants\HookKeys;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Model\Activity;
use BitApps\Crm\Model\Attachment;
use BitApps\Crm\Model\Link;
use BitApps\Crm\Model\Note;

class CrmUserService
{
    public const HAS_CRM_CAPABILITIES_META_KEY = 'has_' . Config::VAR_PREFIX . 'capabilities';

    public const CAPABILITY_SLUG_OTHERS = 'others';

    public const ESSENTIAL_CAPABILITIES = ['bit_crm_menu'];

    public const CAPABILITY_SLUG_DASHBOARD = 'dashboard';

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
            $capabilityOptions = Hooks::applyFilter(HookKeys::CAPABILITY_OPTIONS, $capabilityOptions);
        }

        return $capabilityOptions;
    }

    protected function generateMenuCapabilitiesByModule(array $modules): array
    {
        $menuCapabilities = [];

        foreach ($modules as $module) {
            if (\in_array($module, [self::CAPABILITY_SLUG_OTHERS, self::CAPABILITY_SLUG_DASHBOARD, Activity::MODULE_NAME,
                Note::MODULE_NAME, Link::MODULE_NAME, Attachment::MODULE_NAME])) {
                continue;
            }

            $menuCapabilities[] = Config::VAR_PREFIX . $module . '_menu';
        }

        return $menuCapabilities;
    }
}
