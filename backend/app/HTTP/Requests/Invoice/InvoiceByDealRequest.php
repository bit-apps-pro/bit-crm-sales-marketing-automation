<?php

namespace BitApps\Crm\HTTP\Requests\Invoice;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Rules\Common\SortOrderRule;
use BitApps\Crm\src\Capability;

class InvoiceByDealRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_invoice_view');
    }

    public function rules()
    {
        return [
            'id'        => ['required', 'integer'],
            'page'      => ['nullable', 'integer'],
            'perPage'   => ['nullable', 'integer'],
            'sortBy'    => ['nullable', 'string', 'sanitize:text'],
            'sortOrder' => ['nullable', 'string', new SortOrderRule()],
        ];
    }
}
