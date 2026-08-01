<?php

namespace BitApps\Crm\HTTP\Requests\InvoiceShare;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class ShareLinkRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_invoice_update');
    }

    public function rules()
    {
        return [
            'id' => ['required', 'integer'],
        ];
    }
}
