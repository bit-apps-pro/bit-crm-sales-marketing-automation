<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Constants\HookKeys;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Model\Company;
use BitApps\Crm\Model\Contact;
use BitApps\Crm\Model\Deal;
use BitApps\Crm\Model\Invoice;
use BitApps\Crm\Model\Lead;
use BitApps\Crm\Model\Setting;

class SettingService
{
    /**
     * Which capability owns which setting keys.
     *
     * Pro registers its own entries (product, workflow, history, portal)
     * through the SETTING_KEYS_BY_CAPABILITY filter, so read the map with
     * settingKeysByCapability() rather than using this constant directly.
     */
    private const SETTING_KEYS_BY_CAPABILITY = [
        'bit_crm_setting_lead'        => Lead::SETTINGS_KEYS,
        'bit_crm_setting_contact'     => Contact::SETTINGS_KEYS,
        'bit_crm_setting_company'     => Company::SETTINGS_KEYS,
        'bit_crm_setting_deal'        => Deal::SETTINGS_KEYS,
        'bit_crm_setting_invoice'     => Invoice::SETTINGS_KEYS,
        'bit_crm_setting_integration' => IntegrationSettingsService::SETTINGS_KEYS,
    ];

    public static function getSettingsValue($settingsKey)
    {
        $settings = Setting::findOne(['setting_key' => $settingsKey]);

        if (!$settings) {
            return false;
        }

        return $settings->setting_value;
    }

    /**
     * The capability => setting keys map, after pro modules have registered.
     */
    public static function settingKeysByCapability(): array
    {
        $settingKeysByCapability = Hooks::applyFilter(
            HookKeys::SETTING_KEYS_BY_CAPABILITY,
            self::SETTING_KEYS_BY_CAPABILITY
        );

        return \is_array($settingKeysByCapability) ? $settingKeysByCapability : [];
    }

    /**
     * Capability required to write a given setting key, or null when the key is
     * not one this plugin owns. Callers must treat null as "deny".
     *
     * @param mixed $settingKey
     */
    public static function capabilityForSettingKey($settingKey): ?string
    {
        if (!\is_string($settingKey)) {
            return null;
        }

        foreach (self::settingKeysByCapability() as $capability => $settingKeys) {
            if (
                !\is_string($capability)
                || !\is_array($settingKeys)
                || !\in_array($settingKey, $settingKeys, true)
            ) {
                continue;
            }

            return $capability;
        }

        return null;
    }
}
