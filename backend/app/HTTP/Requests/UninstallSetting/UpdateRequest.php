<?php

namespace BitApps\Crm\HTTP\Requests\UninstallSetting;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class UpdateRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_setting_data_management');
    }

    public function rules()
    {
        return [
            'erase_on_uninstall' => ['required', 'boolean'],
        ];
    }
}
