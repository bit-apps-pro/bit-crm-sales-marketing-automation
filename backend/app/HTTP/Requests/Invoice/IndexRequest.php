<?php

namespace BitApps\Crm\HTTP\Requests\Invoice;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Rules\Common\SortOrderRule;
use BitApps\Crm\src\Capability;

class IndexRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_invoice_view');
    }

    public function rules()
    {
        return [
            'page'      => ['nullable', 'integer'],
            'perPage'   => ['nullable', 'integer'],
            'sortBy'    => ['nullable', 'string', 'sanitize:text'],
            'sortOrder' => ['nullable', 'string', new SortOrderRule()],
            'statuses'  => ['nullable', 'string', 'sanitize:text']
        ];
    }
}
