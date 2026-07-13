<?php

namespace BitApps\Crm\HTTP\Requests\Contact;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class DetachTagsRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_contact_update');
    }

    public function rules()
    {
        return [
            'contact_ids' => ['required', 'array', 'max:100'],
            'tag_ids'     => ['required', 'array'],
        ];
    }

    public function messages()
    {
        return [
            'contact_ids.max' => __('You can detach tags from a maximum of 100 contacts at a time.', 'bit-crm')
        ];
    }
}
