<?php

namespace BitApps\Crm\HTTP\Requests\Deal;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class ShowRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_deal_view');
    }

    public function rules()
    {
        return [
            'id' => ['required', 'integer']
        ];
    }
}
