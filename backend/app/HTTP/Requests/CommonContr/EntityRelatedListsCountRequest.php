<?php

namespace BitApps\Crm\HTTP\Requests\CommonContr;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Rules\ValidModuleRule;
use BitApps\Crm\Services\ModuleService;

class EntityRelatedListsCountRequest extends Request
{
    /**
     * The counts describe one record of the requested module, so they need
     * that module's view capability. Counts alone confirm a record exists and
     * how much activity hangs off it, which is a read of the record.
     */
    public function authorize()
    {
        return ModuleService::canViewModule($this->module);
    }

    public function rules()
    {
        return [
            'module'   => ['required', 'string', new ValidModuleRule()],
            'entityId' => ['required', 'integer'],
        ];
    }
}
