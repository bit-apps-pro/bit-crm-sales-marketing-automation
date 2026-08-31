<?php

namespace BitApps\Crm\HTTP\Requests\CommonContr;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Rules\ValidModuleRule;
use BitApps\Crm\Services\ModuleService;

class RelatedFieldOptionsRequest extends Request
{
    /**
     * Options are drawn from the requested module's records, so the caller
     * needs that module's view capability -- a searchable, paginated option
     * list is a read of the module, whatever the calling screen is.
     *
     * Modules exposing no CRM record data (users, e-commerce catalogues) carry
     * no view capability and stay open; see ModuleService::canViewModule().
     */
    public function authorize()
    {
        return ModuleService::canViewModule($this->relatedModule);
    }

    public function rules()
    {
        return [
            'relatedModule' => ['required', 'string', new ValidModuleRule()],
            'pageNo'        => ['nullable', 'integer'],
            'perPage'       => ['nullable', 'integer'],
            'searchTerm'    => ['nullable', 'string', 'sanitize:text'],
            'selectedValue' => ['nullable', 'integer'],
            'entityId'      => ['nullable', 'integer'],
            'args'          => ['nullable', 'array']
        ];
    }
}
