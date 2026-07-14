<?php

namespace BitApps\Crm\HTTP\Requests\Lead;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class ShowRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_lead_view');
    }

    public function failedAuthorizationMessage()
    {
        return __(' Authorization Error: You don\'t have access!', 'bit-crm-sales-marketing-automation');
    }

    public function rules()
    {
        return [
            'id' => ['required', 'integer']
        ];
    }
}
