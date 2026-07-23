<?php

namespace BitApps\Crm\HTTP\Requests\Contact;

use BitApps\Crm\Constants\HookKeys;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class StoreRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_contact_create');
    }

    public function rules()
    {
        $rules = [
            'systemDefinedFieldsValues.last_name' => ['required', 'string', 'sanitize:text'],
            'systemDefinedFieldsValues.email'     => ['nullable', 'string', 'sanitize:email'],
            'systemDefinedFieldsValues.*'         => ['nullable', 'string', 'sanitize:text'],
            'tagIds'                              => ['nullable', 'array'],
            'tagIds.*'                            => ['nullable', 'integer'],
            'newTagTitles'                        => ['nullable', 'array'],
            'newTagTitles.*'                      => ['nullable', 'string', 'sanitize:text'],
            'clientPortal'                        => ['nullable', 'boolean'],
        ];

        return Hooks::applyFilter(HookKeys::CUSTOM_FIELD_VALUES_RULES, $rules);
    }
}
