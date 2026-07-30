<?php

namespace BitApps\Crm\HTTP\Requests\Note;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Model\Note;
use BitApps\Crm\src\Capability;

class StoreRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_note_create');
    }

    public function rules()
    {
        $isSubModule = $this->type === Note::TYPE_SUBMODULE;

        return [
            'title'          => [$isSubModule ? 'nullable' : 'required', 'string', 'sanitize:text', 'max:255'],
            'details'        => ['nullable', 'string', 'sanitize:wp_kses_post'],
            'attachments'    => ['nullable', 'array'],
            'entity_id'      => ['required', 'integer'],
            'module'         => ['required', 'string', 'sanitize:text'],
            'type'           => ['nullable', 'string', 'sanitize:text'],
            'attributes'     => ['nullable', 'array'],
            'is_shared'      => ['nullable', 'boolean'],
            'submodule_type' => [$isSubModule ? 'required' : 'nullable', 'string', 'sanitize:text'],
        ];
    }
}
