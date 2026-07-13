<?php

namespace BitApps\Crm\HTTP\Requests\Imap;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class IndexRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_setting_imap');
    }

    public function rules()
    {
        return [
            'page' => ['required', 'integer']
        ];
    }
}
