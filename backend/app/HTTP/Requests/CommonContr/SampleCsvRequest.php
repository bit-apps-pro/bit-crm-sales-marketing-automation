<?php

namespace BitApps\Crm\HTTP\Requests\CommonContr;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Rules\Common\SampleFileNameRule;

class SampleCsvRequest extends Request
{
    public function rules()
    {
        return [
            'fileName' => ['required', 'string', 'sanitize:text', new SampleFileNameRule()],
        ];
    }
}
