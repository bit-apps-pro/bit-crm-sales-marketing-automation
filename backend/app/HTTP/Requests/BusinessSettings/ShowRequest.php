<?php

namespace BitApps\Crm\HTTP\Requests\BusinessSettings;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class ShowRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_setting_general');
    }

    public function rules()
    {
        return [];
    }
}
