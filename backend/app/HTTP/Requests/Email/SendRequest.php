<?php

namespace BitApps\Crm\HTTP\Requests\Email;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class SendRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_lead_emails');
    }

    public function rules()
    {
        return [
            'entity_email' => ['required', 'string', 'sanitize:text'],
            'module'       => ['required', 'string', 'sanitize:text'],
            'entity_id'    => ['required', 'integer'],
            'subject'      => ['required', 'string', 'sanitize:text'],
            'message'      => ['required', 'string', 'sanitize:wp_kses_post'],
            'attachments'  => ['nullable', 'array']
        ];
    }
}
