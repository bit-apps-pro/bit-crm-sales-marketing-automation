<?php

namespace BitApps\Crm\HTTP\Requests\Link;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Rules\ValidModuleRule;

class IndexRequest extends Request
{
    public function rules()
    {
        return [
            'page'      => ['required', 'integer'],
            'module'    => ['required', 'string', new ValidModuleRule()],
            'entityId'  => ['required', 'integer'],
            'perPage'   => ['nullable', 'integer'],
            'sortOrder' => ['nullable', 'string'],
            'search'    => ['nullable', 'string'],
        ];
    }
}
