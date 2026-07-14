<?php

namespace BitApps\Crm\HTTP\Requests\Company;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Rules\AdvancedFilter\FilterItemValueRule;
use BitApps\Crm\Rules\Common\SortOrderRule;
use BitApps\Crm\Rules\Common\TagsRule;
use BitApps\Crm\Rules\Company\FiltersRule;
use BitApps\Crm\src\Capability;

class SearchRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_company_view');
    }

    public function rules()
    {
        return [
            'page'                                => ['nullable', 'integer', 'min:1'],
            'perPage'                             => ['nullable', 'integer', 'min:1', 'max:100'],
            'searchTerm'                          => ['nullable', 'string', 'sanitize:text'],
            'sortBy'                              => ['nullable', 'string', 'sanitize:text'],
            'sortOrder'                           => ['nullable', 'string', 'sanitize:text', new SortOrderRule()],
            'filters'                             => ['nullable', 'array', new FiltersRule()],
            'tags'                                => ['nullable', 'array', new TagsRule()],
            'advancedFilterGroups'                => ['nullable', 'array'],
            'advancedFilterGroups.*'              => ['nullable', 'array'],
            'advancedFilterGroups.*.*'            => ['nullable', 'array'],
            'advancedFilterGroups.*.*.field_key'  => ['nullable', 'string', 'sanitize:text'],
            'advancedFilterGroups.*.*.operator'   => ['nullable', 'string', 'sanitize:text'],
            'advancedFilterGroups.*.*.field_type' => ['nullable', 'string', 'sanitize:text'],
            'advancedFilterGroups.*.*.is_custom'  => ['nullable', 'boolean'],
            'advancedFilterGroups.*.*.value'      => ['nullable', new FilterItemValueRule()],
        ];
    }

    public function messages()
    {
        return [
            'advancedFilterGroups.*.*.field_key.string'  => __('Invalid field key!', 'bit-crm-sales-marketing-automation'),
            'advancedFilterGroups.*.*.operator.string'   => __('Invalid operator!', 'bit-crm-sales-marketing-automation'),
            'advancedFilterGroups.*.*.field_type.string' => __('Invalid field type!', 'bit-crm-sales-marketing-automation'),
            'advancedFilterGroups.*.*.is_custom.boolean' => __('Invalid custom field flag!', 'bit-crm-sales-marketing-automation'),
        ];
    }
}
