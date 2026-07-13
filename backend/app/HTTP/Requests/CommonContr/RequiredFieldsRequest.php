<?php

namespace BitApps\Crm\HTTP\Requests\CommonContr;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Rules\ValidModuleRule;

class RequiredFieldsRequest extends Request
{
    public function rules()
    {
        return [
            'module' => ['required', 'string', new ValidModuleRule()],
        ];
    }
}
