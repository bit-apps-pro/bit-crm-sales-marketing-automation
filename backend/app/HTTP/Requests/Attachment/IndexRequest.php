<?php

namespace BitApps\Crm\HTTP\Requests\Attachment;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Rules\ValidModuleRule;
use BitApps\Crm\src\Capability;

class IndexRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_attachment_view');
    }

    public function rules()
    {
        return [
            'page'     => ['required', 'integer'],
            'module'   => ['required', 'string', new ValidModuleRule()],
            'entityId' => ['required', 'integer'],
            'perPage'  => ['nullable', 'integer'],
            'search'   => ['nullable', 'string'],
        ];
    }
}
