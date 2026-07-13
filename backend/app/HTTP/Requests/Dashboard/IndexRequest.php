<?php

namespace BitApps\Crm\HTTP\Requests\Dashboard;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class IndexRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_dashboard');
    }

    public function rules()
    {
        return [
            'startDate' => ['nullable', 'string', 'sanitize:text'],
            'endDate'   => ['nullable', 'string', 'sanitize:text'],
        ];
    }
}
