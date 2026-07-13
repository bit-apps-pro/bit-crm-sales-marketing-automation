<?php

namespace BitApps\Crm\HTTP\Requests\Attachment;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Rules\ValidModuleRule;

class IndexRequest extends Request
{
    // TODO: Uncomment the authorize method when capabilities are implemented
    // public function authorize()
    // {
    //     return Capability::check('cap');
    // }

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
