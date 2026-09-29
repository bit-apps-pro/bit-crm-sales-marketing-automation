<?php

namespace BitApps\Crm\HTTP\Requests\PluginImprovement;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class UpdateRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_manage_license');
    }

    public function rules()
    {
        return [
            'allowTracking' => ['required', 'boolean'],
        ];
    }
}
