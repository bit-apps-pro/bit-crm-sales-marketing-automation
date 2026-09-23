<?php

namespace BitApps\Crm\HTTP\Requests\SampleData;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

/**
 * Shared by every sample data route: none of them take input, and all of
 * them are data-management actions.
 */
class SampleDataRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_setting_data_management');
    }

    public function failedAuthorizationMessage()
    {
        return __('Authorization Error: You don\'t have access!', 'bit-crm-sales-marketing-automation');
    }

    public function rules()
    {
        return [];
    }
}
