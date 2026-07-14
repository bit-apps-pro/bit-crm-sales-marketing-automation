<?php

namespace BitApps\Crm\HTTP\Requests\Tag;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Rules\Common\SortOrderRule;
use BitApps\Crm\Rules\ValidModuleRule;
use BitApps\Crm\src\Capability;

class IndexRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_tag_view');
    }

    public function failedAuthorizationMessage()
    {
        return __('Authorization Error: You don\'t have access!', 'bit-crm-sales-marketing-automation');
    }

    public function rules()
    {
        return [
            'page'       => ['nullable', 'integer'],
            'perPage'    => ['nullable', 'integer'],
            'searchTerm' => ['nullable', 'string', 'sanitize:text'],
            'modules'    => ['nullable', 'array'],
            'modules.*'  => ['nullable', 'string', new ValidModuleRule()],
            'sortBy'     => ['nullable', 'string', 'sanitize:text'],
            'sortOrder'  => ['nullable', 'string', 'sanitize:text', new SortOrderRule()],
        ];
    }
}
