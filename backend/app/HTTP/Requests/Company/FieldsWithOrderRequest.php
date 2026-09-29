<?php

namespace BitApps\Crm\HTTP\Requests\Company;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class FieldsWithOrderRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_menu');
    }

    public function rules()
    {
        return [];
    }
}
