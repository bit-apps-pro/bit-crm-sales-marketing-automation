<?php

namespace BitApps\Crm\HTTP\Requests\Deal;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class AttachTagRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_deal_update');
    }

    public function rules()
    {
        return [
            'deal_id' => ['required', 'integer'],
            'title'   => ['required', 'string', 'sanitize:text']
        ];
    }
}
