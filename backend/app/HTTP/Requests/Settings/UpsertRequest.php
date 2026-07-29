<?php

namespace BitApps\Crm\HTTP\Requests\Settings;

use BitApps\Crm\Constants\HookKeys;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Model\Company;
use BitApps\Crm\Model\Contact;
use BitApps\Crm\Model\Deal;
use BitApps\Crm\Model\Invoice;
use BitApps\Crm\Model\Lead;
use BitApps\Crm\Services\IntegrationSettingsService;
use BitApps\Crm\src\Capability;

class UpsertRequest extends Request
{
    private const SETTING_KEYS = [
        'bit_crm_setting_lead'        => Lead::SETTINGS_KEYS,
        'bit_crm_setting_contact'     => Contact::SETTINGS_KEYS,
        'bit_crm_setting_company'     => Company::SETTINGS_KEYS,
        'bit_crm_setting_deal'        => Deal::SETTINGS_KEYS,
        'bit_crm_setting_invoice'     => Invoice::SETTINGS_KEYS,
        'bit_crm_setting_integration' => IntegrationSettingsService::SETTINGS_KEYS,
    ];

    public function authorize()
    {
        $capability = $this->getSettingCapability();

        return $capability !== false && Capability::check($capability);
    }

    public function rules()
    {
        return [
            'setting_key'   => ['required', 'string', 'sanitize:text'],
            'setting_value' => ['required', 'array'],
        ];
    }

    private function getSettingCapability(): false|string
    {
        if (!\is_string($this->setting_key)) {
            return false;
        }

        $settingKeysByCapability = Hooks::applyFilter(
            HookKeys::SETTING_KEYS_BY_CAPABILITY,
            self::SETTING_KEYS
        );

        if (!\is_array($settingKeysByCapability)) {
            return false;
        }

        foreach ($settingKeysByCapability as $capability => $settingKeys) {
            if (
                !\is_string($capability)
                || !\is_array($settingKeys)
                || !\in_array($this->setting_key, $settingKeys, true)
            ) {
                continue;
            }

            return $capability;
        }

        return false;
    }
}
