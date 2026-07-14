<?php

namespace BitApps\Crm\HTTP\Requests\Trash;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class DestroyRequest extends Request
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
            'ids' => ['required', 'array', 'max:100'],
        ];
    }

    public function messages()
    {
        return [
            'ids.max' => __('You can delete trashes to a maximum of 100 trashes at a time.', 'bit-crm-sales-marketing-automation')
        ];
    }
}
