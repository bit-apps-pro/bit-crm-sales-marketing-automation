<?php

namespace BitApps\Crm\HTTP\Requests\Note;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;

class StoreRequest extends Request
{
    // TODO: Uncomment the authorize method when capabilities are implemented
    // public function authorize()
    // {
    //     return Capability::check('cap');
    // }

    public function rules()
    {
        $isSubModule = ($this->type !== null && $this->type !== 'submodule') ? false : true;

        return [
            'title'       => [$isSubModule ? 'nullable' : 'required', 'string', 'sanitize:text', 'max:255'],
            'details'     => ['nullable', 'string', 'sanitize:wp_kses_post'],
            'attachments' => ['nullable', 'array'],
            'entity_id'   => ['required', 'integer'],
            'module'      => ['required', 'string', 'sanitize:text'],
            'is_shared'   => ['nullable', 'boolean'],
            'type'        => ['nullable', 'string', 'sanitize:text'],
            'attributes'  => ['nullable', 'array'],
        ];
    }
}
