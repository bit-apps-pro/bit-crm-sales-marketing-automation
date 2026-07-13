<?php

namespace BitApps\Crm\HTTP\Requests\Imap;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class UpdateRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_setting_imap');
    }

    public function rules()
    {
        return [
            'id'           => ['required', 'integer'],
            'title'        => ['required', 'string', 'sanitize:text'],
            'platform'     => ['required', 'string', 'sanitize:text'],
            'username'     => ['required', 'string', 'sanitize:email'],
            'app_password' => ['required', 'string'],
            'host'         => [($this->get('platform') === 'other' ? 'required' : 'nullable'), 'string', 'sanitize:text'],
            'port'         => [($this->get('platform') === 'other' ? 'required' : 'nullable'), 'integer'],
            'encryption'   => [($this->get('platform') === 'other' ? 'required' : 'nullable'), 'string', 'sanitize:text'],
            'is_private'   => ['required', 'string', 'sanitize:text'],
        ];
    }
}
