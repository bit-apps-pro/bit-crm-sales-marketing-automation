<?php

namespace BitApps\Crm\HTTP\Requests\Email;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;

class ViewRequest extends Request
{
    public function rules(): array
    {
        return [
            'id' => ['required', 'integer']
        ];
    }
}
