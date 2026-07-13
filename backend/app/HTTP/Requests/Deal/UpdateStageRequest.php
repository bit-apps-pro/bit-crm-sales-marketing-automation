<?php

namespace BitApps\Crm\HTTP\Requests\Deal;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class UpdateStageRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_deal_update');
    }

    public function rules()
    {
        return [
            'id'          => ['required', 'integer'],
            'stage'       => ['required', 'string', 'sanitize:text'],
            'probability' => ['required', 'integer'],
            'amount'      => ['nullable', 'numeric'],
            'closed_at'   => ['nullable', 'string', 'sanitize:text']
        ];
    }
}
