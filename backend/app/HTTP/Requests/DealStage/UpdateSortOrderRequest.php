<?php

namespace BitApps\Crm\HTTP\Requests\DealStage;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class UpdateSortOrderRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_setting_deal');
    }

    public function rules()
    {
        return [
            'stages'               => ['required', 'array'],
            'stages.*'             => ['required', 'array'],
            'stages.*.key'         => ['required', 'string', 'sanitize:text'],
            'stages.*.name'        => ['required', 'string', 'sanitize:text'],
            'stages.*.color'       => ['nullable', 'string', 'sanitize:text'],
            'stages.*.probability' => ['required', 'integer'],
        ];
    }
}
