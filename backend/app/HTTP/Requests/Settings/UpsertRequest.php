<?php

namespace BitApps\Crm\HTTP\Requests\Settings;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Services\SettingService;
use BitApps\Crm\src\Capability;

class UpsertRequest extends Request
{
    public function authorize()
    {
        $capability = SettingService::capabilityForSettingKey($this->setting_key);

        return $capability !== null && Capability::check($capability);
    }

    public function rules()
    {
        return [
            'setting_key'   => ['required', 'string', 'sanitize:text'],
            'setting_value' => ['required', 'array'],
        ];
    }
}
