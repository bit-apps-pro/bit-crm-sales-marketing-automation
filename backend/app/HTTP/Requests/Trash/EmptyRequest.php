<?php

namespace BitApps\Crm\HTTP\Requests\Trash;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class EmptyRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_setting_data_management');
    }

    public function failedAuthorizationMessage()
    {
        return __('Authorization Error: You don\'t have access!', 'bit-crm');
    }

    public function rules()
    {
        // Returning an empty array as no validation rules are needed for this request.
        return [];
    }
}
