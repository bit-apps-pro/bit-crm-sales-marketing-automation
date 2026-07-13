<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Model\Setting;
use BitApps\Crm\Utils\Logger;
use Throwable;

class BusinessSettingService
{
    public const SETTING_KEY = 'business_settings';

    public static function exists(): bool
    {
        return (bool) Setting::findOne(['setting_key' => self::SETTING_KEY]);
    }

    public static function store(array $settingValue): ?Setting
    {
        try {
            $setting = Setting::insert(
                [
                    'setting_key'   => self::SETTING_KEY,
                    'setting_value' => $settingValue,
                    'created_by'    => get_current_user_id(),
                ]
            );

            if (!$setting) {
                return null;
            }

            return $setting;
        } catch (Throwable $th) {
            Logger::error($th);

            return null;
        }
    }

    public static function update(array $settingValue): ?Setting
    {
        $setting = Setting::findOne(['setting_key' => self::SETTING_KEY]);

        if (!$setting) {
            return null;
        }

        try {
            $updated = $setting->update(
                [
                    'setting_value' => $settingValue,
                    'updated_by'    => get_current_user_id(),
                ]
            );

            if (!$updated) {
                return null;
            }

            return $setting;
        } catch (Throwable $th) {
            Logger::error($th);

            return null;
        }
    }

    /**
     * Get the stored business settings, or null when none exist.
     *
     * @return mixed
     */
    public static function getSettings()
    {
        $setting = Setting::findOne(['setting_key' => self::SETTING_KEY]);

        if (!$setting) {
            return;
        }

        return $setting->setting_value;
    }
}
