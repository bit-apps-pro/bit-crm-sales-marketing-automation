<?php

namespace BitApps\Crm\HTTP\Requests\CommonContr;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;

class StatesRequest extends Request
{
    public function rules()
    {
        return [
            'country' => ['required', 'string', 'sanitize:text'],
        ];
    }
}
