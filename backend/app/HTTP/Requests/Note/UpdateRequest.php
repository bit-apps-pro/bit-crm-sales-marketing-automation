<?php

namespace BitApps\Crm\HTTP\Requests\Note;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Model\Note;
use BitApps\Crm\src\Capability;

class UpdateRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_note_update');
    }

    public function rules()
    {
        $isSubModule = $this->type === Note::TYPE_SUBMODULE;

        return [
            'id'          => ['required', 'integer'],
            'title'       => [$isSubModule ? 'nullable' : 'required', 'string', 'sanitize:text', 'max:255'],
            'details'     => ['nullable', 'string', 'sanitize:wp_kses_post'],
            'is_shared'   => [$isSubModule ? 'nullable' : 'required', 'boolean'],
            'attachments' => ['nullable', 'array'],
            'attributes'  => ['nullable', 'array'],
        ];
    }
}
