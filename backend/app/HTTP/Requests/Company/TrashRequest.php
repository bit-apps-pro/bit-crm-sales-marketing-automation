<?php

namespace BitApps\Crm\HTTP\Requests\Company;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class TrashRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_company_delete');
    }

    public function failedAuthorizationMessage()
    {
        return __(' Authorization Error: You don\'t have access!', 'bit-crm');
    }

    public function rules()
    {
        return [
            'ids'   => ['required', 'array'],
            'ids.*' => ['required', 'integer']
        ];
    }
}
