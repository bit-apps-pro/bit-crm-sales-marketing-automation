<?php

namespace BitApps\Crm\HTTP\Requests\Activity;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Rules\ValidModuleRule;

class UpcomingRequest extends Request
{
    public function rules()
    {
        return [
            'module'   => ['required', 'string', new ValidModuleRule()],
            'entityId' => ['required', 'integer'],
            'limit'    => ['nullable', 'integer'],
        ];
    }
}
