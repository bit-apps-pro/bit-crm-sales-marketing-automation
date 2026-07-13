<?php

namespace BitApps\Crm\HTTP\Requests\Contact;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class DetachTagRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_contact_update');
    }

    public function rules()
    {
        return [
            'tag_id'     => ['required', 'integer'],
            'contact_id' => ['required', 'integer']
        ];
    }
}
