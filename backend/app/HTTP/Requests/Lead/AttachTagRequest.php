<?php

namespace BitApps\Crm\HTTP\Requests\Lead;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class AttachTagRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_lead_update');
    }

    public function rules()
    {
        return [
            'title'   => ['required', 'string', 'sanitize:text'],
            'lead_id' => ['required', 'integer']
        ];
    }
}
