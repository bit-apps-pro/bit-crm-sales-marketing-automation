<?php

namespace BitApps\Crm\HTTP\Requests\Contact;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class DestroyRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_contact_delete');
    }

    public function rules()
    {
        return [
            'ids' => ['required', 'array']
        ];
    }
}
