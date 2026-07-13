<?php

namespace BitApps\Crm\HTTP\Requests\InvoiceTerm;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class OptionsRequest extends Request
{
    // public function authorize()
    // {
    //     return Capability::check('bit_crm_setting_invoice');
    // }

    // / Capabilitiy Will In Future.

    public function rules()
    {
        return [];
    }
}
