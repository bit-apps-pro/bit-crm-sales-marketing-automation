<?php

namespace BitApps\Crm\HTTP\Requests\BitForm;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class FormsRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_setting_integration');
    }

    public function rules()
    {
        return [];
    }
}
