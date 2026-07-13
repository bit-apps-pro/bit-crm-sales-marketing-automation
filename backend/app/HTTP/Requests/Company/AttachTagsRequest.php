<?php

namespace BitApps\Crm\HTTP\Requests\Company;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class AttachTagsRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_company_update');
    }

    public function rules()
    {
        return [
            'company_ids'   => ['required', 'array'],
            'company_ids.*' => ['required', 'integer'],
            'tag_ids'       => ['required', 'array'],
            'tag_ids.*'     => ['required', 'integer']
        ];
    }
}
