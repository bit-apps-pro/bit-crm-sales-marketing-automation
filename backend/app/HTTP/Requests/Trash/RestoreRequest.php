<?php

namespace BitApps\Crm\HTTP\Requests\Trash;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class RestoreRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_setting_data_management');
    }

    public function failedAuthorizationMessage()
    {
        return __('Authorization Error: You don\'t have access!', 'bit-crm-sales-marketing-automation');
    }

    public function rules()
    {
        return [
            'ids' => ['required', 'array'],
        ];
    }
}
