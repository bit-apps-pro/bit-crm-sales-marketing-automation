<?php

namespace BitApps\Crm\HTTP\Requests\Contact;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class AttachTagRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_contact_update');
    }

    public function rules()
    {
        return [
            'title'      => ['required', 'string', 'sanitize:text'],
            'contact_id' => ['required', 'integer']
        ];
    }
}
