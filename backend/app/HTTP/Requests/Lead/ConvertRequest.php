<?php

namespace BitApps\Crm\HTTP\Requests\Lead;

use BitApps\Crm\Constants\HookKeys;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Rules\ValidModuleRule;
use BitApps\Crm\src\Capability;

final class ConvertRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_lead_update') && Capability::check('bit_crm_contact_create');
    }

    public function rules()
    {
        $rules = [
            'ids'                                          => ['required', 'array', 'max:100', 'min:1'],
            'ids.*'                                        => ['required', 'integer'],
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

    public function messages()
    {
        return [
            'ids.max' => __('You can convert leads to a maximum of 100 leads at a time.', 'bit-crm-sales-marketing-automation'),
            'ids.min' => __('You must convert at least 1 lead at a time.', 'bit-crm-sales-marketing-automation'),
        ];
    }
}
