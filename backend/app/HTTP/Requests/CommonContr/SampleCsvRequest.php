<?php

namespace BitApps\Crm\HTTP\Requests\CommonContr;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;

class SampleCsvRequest extends Request
{
    public function rules()
    {
        return [
            'fileName' => ['required', 'string', 'sanitize:text'],
        ];
    }
}
