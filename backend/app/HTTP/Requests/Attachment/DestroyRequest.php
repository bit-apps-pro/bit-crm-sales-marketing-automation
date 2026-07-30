<?php

namespace BitApps\Crm\HTTP\Requests\Attachment;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class DestroyRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_attachment_delete');
    }

    public function rules()
    {
        return [
            'id' => ['required', 'integer']
        ];
    }
}
