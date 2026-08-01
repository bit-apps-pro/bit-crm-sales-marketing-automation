<?php

namespace BitApps\Crm\HTTP\Requests\InvoiceShare;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;

class PublicShowRequest extends Request
{
    public function rules()
    {
        return [
            'id'    => ['required', 'integer'],
            'token' => ['required', 'string', 'sanitize:text'],
        ];
    }
}
