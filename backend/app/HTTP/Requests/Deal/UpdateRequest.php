<?php

namespace BitApps\Crm\HTTP\Requests\Deal;

use BitApps\Crm\Constants\HookKeys;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class UpdateRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_deal_update');
    }

    public function rules()
    {
        $rules = [
            'id'                                   => ['required', 'integer'],
            'systemDefinedFieldsValues.name'       => ['required', 'string', 'sanitize:text'],
            'systemDefinedFieldsValues.stage'      => ['required', 'string', 'sanitize:text'],
            'systemDefinedFieldsValues.contact_id' => ['required', 'integer'],
            'systemDefinedFieldsValues.*'          => ['nullable', 'string', 'sanitize:text'],
            'lineItems'                            => ['nullable', 'array'],
            'lineItems.*.product_name'             => ['nullable', 'string', 'sanitize:text'],
            'lineItems.*.unit_price'               => ['nullable', 'numeric'],
            'lineItems.*.quantity'                 => ['nullable', 'integer'],
            'lineItems.*.discount_percentage'      => ['nullable', 'integer'],
            'lineItems.*.tax_rate'                 => ['nullable', 'integer'],
            'lineItems.*.product_code'             => ['nullable', 'string', 'sanitize:text'],
            'lineItems.*.product_source'           => ['nullable', 'string', 'sanitize:text'],
            'lineItems.*.description'              => ['nullable', 'string', 'sanitize:text'],
            'lineItems.*.product_id'               => ['nullable', 'integer'],
        ];

        return Hooks::applyFilter(HookKeys::CUSTOM_FIELD_VALUES_RULES, $rules);
    }
}
