<?php

namespace BitApps\Crm\HTTP\Requests\Deal;

use BitApps\Crm\Constants\HookKeys;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Rules\Common\NumberBetweenRule;
use BitApps\Crm\src\Capability;

class StoreRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_deal_create');
    }

    public function rules()
    {
        $rules = [
            'systemDefinedFieldsValues.name'       => ['required', 'string', 'sanitize:text'],
            'systemDefinedFieldsValues.stage'      => ['required', 'string', 'sanitize:text'],
            'systemDefinedFieldsValues.contact_id' => ['required', 'integer'],
            'systemDefinedFieldsValues.*'          => ['nullable', 'string', 'sanitize:text'],
            'tagIds'                               => ['nullable', 'array'],
            'tagIds.*'                             => ['nullable', 'integer'],
            'newTagTitles'                         => ['nullable', 'array'],
            'newTagTitles.*'                       => ['nullable', 'string', 'sanitize:text'],
            'lineItems'                            => ['nullable', 'array'],
            'lineItems.*.product_name'             => ['nullable', 'string', 'sanitize:text'],
            'lineItems.*.unit_price'               => ['nullable', 'numeric'],
            'lineItems.*.quantity'                 => ['nullable', 'integer'],
            'lineItems.*.discount_percentage'      => ['nullable', 'numeric', new NumberBetweenRule(0, 100)],
            'lineItems.*.tax_rate'                 => ['nullable', 'numeric', new NumberBetweenRule(0, 1000)],
            'lineItems.*.product_code'             => ['nullable', 'string', 'sanitize:text'],
            'lineItems.*.product_source'           => ['nullable', 'string', 'sanitize:text'],
            'lineItems.*.description'              => ['nullable', 'string', 'sanitize:text'],
            'lineItems.*.product_id'               => ['nullable', 'integer'],
        ];

        return Hooks::applyFilter(HookKeys::CUSTOM_FIELD_VALUES_RULES, $rules);
    }
}
