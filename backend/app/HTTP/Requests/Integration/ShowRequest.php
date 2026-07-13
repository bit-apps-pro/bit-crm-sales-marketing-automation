<?php

namespace BitApps\Crm\HTTP\Requests\Integration;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class ShowRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_setting_integration');
    }

    public function rules()
    {
        return [
            'setting_key' => ['required', 'string', 'sanitize:text'],
        ];
    }
}
