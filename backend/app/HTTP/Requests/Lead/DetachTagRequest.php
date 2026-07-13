<?php

namespace BitApps\Crm\HTTP\Requests\Lead;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class DetachTagRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_lead_update');
    }

    public function failedAuthorizationMessage()
    {
        return __(' Authorization Error: You don\'t have access!', 'bit-crm');
    }

    public function rules()
    {
        return [
            'tag_id'  => ['required', 'integer'],
            'lead_id' => ['required', 'integer']
        ];
    }
}
