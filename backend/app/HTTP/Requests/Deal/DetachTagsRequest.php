<?php

namespace BitApps\Crm\HTTP\Requests\Deal;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class DetachTagsRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_deal_update');
    }

    public function rules()
    {
        return [
            'deal_ids'   => ['required', 'array'],
            'deal_ids.*' => ['required', 'integer'],
            'tag_ids'    => ['required', 'array'],
            'tag_ids.*'  => ['required', 'integer']
        ];
    }
}
