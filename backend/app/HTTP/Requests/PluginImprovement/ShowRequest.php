<?php

namespace BitApps\Crm\HTTP\Requests\PluginImprovement;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class ShowRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_manage_license');
    }

    public function rules()
    {
        return [];
    }
}
