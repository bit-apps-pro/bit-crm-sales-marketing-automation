<?php

namespace BitApps\Crm\HTTP\Requests\Contact;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class ImportRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_contact_import');
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
