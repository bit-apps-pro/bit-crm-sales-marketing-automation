<?php

namespace BitApps\Crm\HTTP\Requests\Invoice;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class SendInvoiceRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_invoice_view');
    }

    public function rules()
    {
        return [
            'id' => ['required', 'integer'],
        ];
    }
}
