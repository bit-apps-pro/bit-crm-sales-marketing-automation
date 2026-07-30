<?php

namespace BitApps\Crm\HTTP\Requests\Link;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class UpdateRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_link_update');
    }

    public function rules()
    {
        return [
            'id'          => ['required', 'integer'],
            'title'       => ['required', 'string', 'sanitize:text', 'max:255'],
            'description' => ['nullable', 'string', 'sanitize:text'],
            'link'        => ['required', 'string', 'sanitize:text', 'max:255'],
            'attributes'  => ['nullable', 'array'],
        ];
    }
}
