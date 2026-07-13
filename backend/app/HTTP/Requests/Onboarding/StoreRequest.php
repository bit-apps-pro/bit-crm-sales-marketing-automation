<?php

namespace BitApps\Crm\HTTP\Requests\Onboarding;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class StoreRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_menu');
    }

    public function rules()
    {
        return [
            'name'      => ['nullable', 'string', 'sanitize:text'],
            'email'     => ['nullable', 'email', 'sanitize:email'],
            'plugins'   => ['nullable', 'array'],
            'plugins.*' => ['nullable', 'string', 'sanitize:text'],
        ];
    }
}
