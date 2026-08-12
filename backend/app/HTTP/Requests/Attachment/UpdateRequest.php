<?php

namespace BitApps\Crm\HTTP\Requests\Attachment;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class UpdateRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_attachment_update');
    }

    public function rules()
    {
        return [
            'id'        => ['required', 'integer'],
            'is_shared' => ['required', 'boolean'],
        ];
    }
}
