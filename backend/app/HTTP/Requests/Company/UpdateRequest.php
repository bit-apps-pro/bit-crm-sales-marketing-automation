<?php

namespace BitApps\Crm\HTTP\Requests\Company;

use BitApps\Crm\Constants\HookKeys;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class UpdateRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_company_update');
    }

    public function rules()
    {
        $rules = [
            'id'                             => ['required', 'integer'],
            'systemDefinedFieldsValues.name' => ['required', 'string', 'sanitize:text'],
            'systemDefinedFieldsValues.*'    => ['nullable', 'string', 'sanitize:text'],
        ];

        return Hooks::applyFilter(HookKeys::CUSTOM_FIELD_VALUES_RULES, $rules);
    }
}
