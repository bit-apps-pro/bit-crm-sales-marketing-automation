<?php

namespace BitApps\Crm\HTTP\Requests\Note;

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
            'page'      => ['required', 'integer'],
            'module'    => ['required', 'string', 'sanitize:text', new ValidModuleRule()],
            'entityId'  => ['required', 'integer'],
            'perPage'   => ['nullable', 'integer'],
            'sortOrder' => ['nullable', 'string', 'sanitize:text'],
            'search'    => ['nullable', 'string', 'sanitize:text'],
        ];
    }
}
