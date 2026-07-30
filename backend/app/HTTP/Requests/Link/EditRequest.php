<?php

namespace BitApps\Crm\HTTP\Requests\Link;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class EditRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_link_view');
    }

    public function rules()
    {
        return [
            'id' => ['required', 'integer']
        ];
    }
}
