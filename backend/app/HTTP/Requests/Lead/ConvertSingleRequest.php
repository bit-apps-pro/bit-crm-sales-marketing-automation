<?php

namespace BitApps\Crm\HTTP\Requests\Lead;

use BitApps\Crm\Constants\HookKeys;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Rules\ValidModuleRule;
use BitApps\Crm\src\Capability;

final class ConvertSingleRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_lead_update') && Capability::check('bit_crm_contact_create');
    }

    public function rules()
    {
        $rules = [
            'id'                                           => ['required', 'numeric'],
            'convertTo'                                    => ['required', 'array'],
            'convertTo.*'                                  => ['required', 'string', new ValidModuleRule()],
            'moveRelatedData'                              => ['nullable', 'array'],
            'moveRelatedData.*'                            => ['nullable', 'string'],
            'moveRelatedDataTo'                            => ['required', 'string', new ValidModuleRule()],
            'moveTagsTo'                                   => ['nullable', 'array'],
            'moveTagsTo.*'                                 => ['nullable', 'string', new ValidModuleRule()],
            'defaultOwnerId'                               => ['nullable', 'numeric'],
            'dealFieldOverrides'                           => ['nullable', 'array'],
            'dealFieldOverrides.systemDefinedFieldsValues' => ['nullable', 'array'],
        ];

        return Hooks::applyFilter(HookKeys::DEAL_OVERRIDES_CUSTOM_FIELD_RULES, $rules);
    }
}
