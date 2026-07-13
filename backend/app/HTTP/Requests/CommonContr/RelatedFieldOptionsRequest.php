<?php

namespace BitApps\Crm\HTTP\Requests\CommonContr;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Rules\ValidModuleRule;

class RelatedFieldOptionsRequest extends Request
{
    public function rules()
    {
        return [
            'relatedModule' => ['required', 'string', new ValidModuleRule()],
            'pageNo'        => ['nullable', 'integer'],
            'perPage'       => ['nullable', 'integer'],
            'searchTerm'    => ['nullable', 'string', 'sanitize:text'],
            'selectedValue' => ['nullable', 'integer'],
            'entityId'      => ['nullable', 'integer'],
            'args'          => ['nullable', 'array']
        ];
    }
}
