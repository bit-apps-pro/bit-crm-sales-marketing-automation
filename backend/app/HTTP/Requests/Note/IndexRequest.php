<?php

namespace BitApps\Crm\HTTP\Requests\Note;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Rules\ValidModuleRule;
use BitApps\Crm\src\Capability;

class IndexRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_note_view');
    }

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
