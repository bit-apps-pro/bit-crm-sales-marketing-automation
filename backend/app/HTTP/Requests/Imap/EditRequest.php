<?php

namespace BitApps\Crm\HTTP\Requests\Imap;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class EditRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_setting_imap');
    }

    public function rules()
    {
        return [
            'id' => ['required', 'integer']
        ];
    }
}
