<?php

namespace BitApps\Crm\HTTP\Requests\Tag;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class EditRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_tag_update');
    }

    public function failedAuthorizationMessage()
    {
        return __('Authorization Error: You don\'t have access!', 'bit-crm');
    }

    public function rules()
    {
        return [
            'id' => ['required', 'integer']
        ];
    }
}
