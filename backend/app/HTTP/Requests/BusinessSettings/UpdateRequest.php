<?php

namespace BitApps\Crm\HTTP\Requests\BusinessSettings;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Rules\BusinessSettings\FileSizeRule;
use BitApps\Crm\src\Capability;

class UpdateRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_setting_business');
    }

    public function rules()
    {
        return [
            'logo_url'      => ['nullable', 'url', 'sanitize:url', new FileSizeRule()],
            'city'          => ['nullable', 'string', 'sanitize:text'],
            'country'       => ['nullable', 'string', 'sanitize:text'],
            'email'         => ['required', 'email', 'sanitize:email'],
            'fax_number'    => ['nullable', 'string', 'sanitize:text'],
            'mobile_number' => ['nullable', 'string', 'sanitize:text'],
            'name'          => ['required', 'string', 'sanitize:text'],
            'phone_number'  => ['nullable', 'string', 'sanitize:text'],
            'postal_code'   => ['nullable', 'string', 'sanitize:text'],
            'state'         => ['nullable', 'string', 'sanitize:text'],
            'street'        => ['nullable', 'string', 'sanitize:text'],
            'website'       => ['nullable', 'url', 'sanitize:url']
        ];
    }
}
