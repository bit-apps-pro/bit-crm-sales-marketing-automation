<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Model\Setting;

class SettingService
{
    public static function getSettingsValue($settingsKey)
    {
        $settings = Setting::findOne(['setting_key' => $settingsKey]);

        if (!$settings) {
            return false;
        }

        return $settings->setting_value;
    }
}
