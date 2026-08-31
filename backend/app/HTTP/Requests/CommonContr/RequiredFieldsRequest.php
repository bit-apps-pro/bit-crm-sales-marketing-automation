<?php

namespace BitApps\Crm\HTTP\Requests\CommonContr;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Rules\ValidModuleRule;
use BitApps\Crm\Services\ModuleService;

class RequiredFieldsRequest extends Request
{
    /**
     * Returns the module's field definitions, not its records, so the module
     * view capability is the right gate: it is the same schema already visible
     * to anyone who may read the module.
     */
    public function authorize()
    {
        return ModuleService::canViewModule($this->module);
    }

    public function rules()
    {
        return [
            'module' => ['required', 'string', new ValidModuleRule()],
        ];
    }
}
