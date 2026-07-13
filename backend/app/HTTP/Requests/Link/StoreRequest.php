<?php

namespace BitApps\Crm\HTTP\Requests\Link;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;

class StoreRequest extends Request
{
    public function rules()
    {
        return [
            'title'       => ['required', 'string', 'sanitize:text', 'max:255'],
            'description' => ['nullable', 'string', 'sanitize:text'],
            'link'        => ['required', 'string', 'sanitize:text', 'max:255'],
            'entity_id'   => ['required', 'integer'],
            'module'      => ['required', 'string', 'sanitize:text'],
            'attributes'  => ['nullable', 'array'],
        ];
    }
}
