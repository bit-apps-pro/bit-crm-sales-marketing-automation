<?php

namespace BitApps\Crm\HTTP\Requests\ActivityLog;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class IndexRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_history_view');
    }

    public function failedAuthorizationMessage()
    {
        return __(' Authorization Error: You don\'t have access!', 'bit-crm');
    }

    public function rules()
    {
        return [
            'module'    => ['required', 'string', 'sanitize:text'],
            'entity_id' => ['required', 'integer']
        ];
    }
}
