<?php

namespace BitApps\Crm\HTTP\Requests\Lead;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class AttachTagsRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_lead_update');
    }

    public function failedAuthorizationMessage()
    {
        return __(' Authorization Error: You don\'t have access!', 'bit-crm-sales-marketing-automation');
    }

    public function rules()
    {
        return [
            'lead_ids' => ['required', 'array', 'max:100'],
            'tag_ids'  => ['required', 'array'],
        ];
    }

    public function messages()
    {
        return [
            'lead_ids.max' => __('You can attach tags to a maximum of 100 leads at a time.', 'bit-crm-sales-marketing-automation')
        ];
    }
}
