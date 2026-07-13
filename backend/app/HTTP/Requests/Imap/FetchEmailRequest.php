<?php

namespace BitApps\Crm\HTTP\Requests\Imap;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class FetchEmailRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_lead_emails');
    }

    public function rules()
    {
        return [
            'email'    => ['required', 'string', 'email'],
            'imap_id'  => ['required', 'integer'],
            'autoSync' => ['nullable', 'boolean']
        ];
    }
}
