<?php

namespace BitApps\Crm\HTTP\Requests\InvoiceTerm;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class UpsertRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_setting_invoice');
    }

    public function rules()
    {
        return [
            'key'  => ['required', 'string', 'sanitize:text'],
            'name' => ['required', 'string', 'sanitize:text'],
            'days' => ['required', 'integer'],
        ];
    }
}
