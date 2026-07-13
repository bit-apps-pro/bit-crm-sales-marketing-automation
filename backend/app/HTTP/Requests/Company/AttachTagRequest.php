<?php

namespace BitApps\Crm\HTTP\Requests\Company;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class AttachTagRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_company_update');
    }

    public function rules()
    {
        return [
            'company_id' => ['required', 'integer'],
            'title'      => ['required', 'string', 'sanitize:text']
        ];
    }
}
