<?php

namespace BitApps\Crm\HTTP\Requests\Activity;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Rules\ValidModuleRule;
use BitApps\Crm\src\Capability;

class EntitiesByModuleRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_activity_view') || Capability::check('bit_crm_activity_create');
    }

    public function rules()
    {
        return [
            'module' => ['required', 'string', new ValidModuleRule()],
        ];
    }
}
