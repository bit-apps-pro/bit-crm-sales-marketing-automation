<?php

namespace BitApps\Crm\HTTP\Requests\DealStage;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class UnarchiveRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_setting_deal');
    }

    public function rules()
    {
        return [
            'keys'   => ['required', 'array'],
            'keys.*' => ['required', 'string', 'sanitize:text'],
        ];
    }
}
