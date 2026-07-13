<?php

namespace BitApps\Crm\HTTP\Requests\Lead;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class ImportRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_lead_import');
    }

    public function failedAuthorizationMessage()
    {
        return __(' Authorization Error: You don\'t have access!', 'bit-crm');
    }

    public function rules()
    {
        return [
            'options' => ['nullable', 'json'],
            'fields'  => ['required', 'json'],
            'file'    => ['nullable']
        ];
    }
}
