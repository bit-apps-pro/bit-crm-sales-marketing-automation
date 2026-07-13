<?php

namespace BitApps\Crm\HTTP\Requests\Link;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;

class EditRequest extends Request
{
    public function rules()
    {
        return [
            'id' => ['required', 'integer']
        ];
    }
}
