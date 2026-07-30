<?php

namespace BitApps\Crm\HTTP\Requests\Activity;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Rules\ValidModuleRule;
use BitApps\Crm\src\Capability;

class UpcomingRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_activity_view');
    }

    public function rules()
    {
        return [
            'module'   => ['required', 'string', new ValidModuleRule()],
            'entityId' => ['required', 'integer'],
            'limit'    => ['nullable', 'integer'],
        ];
    }
}
