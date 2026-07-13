<?php

namespace BitApps\Crm\HTTP\Requests\Company;

use BitApps\Crm\Constants\HookKeys;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class StoreRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_company_create');
    }

    public function rules()
    {
        $rules = [
            'systemDefinedFieldsValues.name' => ['required', 'string', 'sanitize:text'],
            'systemDefinedFieldsValues.*'    => ['nullable', 'string', 'sanitize:text'],
            'tagIds'                         => ['nullable', 'array'],
            'tagIds.*'                       => ['nullable', 'integer'],
            'newTagTitles'                   => ['nullable', 'array'],
            'newTagTitles.*'                 => ['nullable', 'string', 'sanitize:text'],
        ];

        return Hooks::applyFilter(HookKeys::CUSTOM_FIELD_VALUES_RULES, $rules);
    }
}
