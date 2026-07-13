<?php

namespace BitApps\Crm\HTTP\Requests\Currency;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class HomeCurrencyStoreRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_setting_currency');
    }

    public function rules()
    {
        return [
            'currency'                    => ['required', 'string', 'sanitize:text'],
            'decimal_places'              => ['required', 'integer', 'between:0,6'],
            'decimal_separator'           => ['required', 'string', 'sanitize:text'],
            'symbol'                      => ['required', 'string', 'sanitize:text'],
            'thousand_separator'          => ['required', 'string', 'sanitize:text'],
            'thousand_separator_selector' => ['required', 'string', 'sanitize:text'],
            'numeral_system'              => ['required', 'string', 'sanitize:text'],
        ];
    }

    public function messages()
    {
        return [
            'decimal_places.between' => __('The decimal places must be between 0 and 6.', 'bit-crm'),
        ];
    }
}
