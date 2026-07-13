<?php

namespace BitApps\Crm\HTTP\Requests\Invoice;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class UpdateStatusRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_invoice_update');
    }

    public function rules()
    {
        return [
            'id'     => ['required', 'integer'],
            'status' => ['required', 'string'],
        ];
    }
}
