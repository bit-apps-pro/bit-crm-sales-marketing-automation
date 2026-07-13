<?php

namespace BitApps\Crm\HTTP\Requests\Note;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;

class UpdateRequest extends Request
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
            'id'          => ['required', 'integer'],
            'title'       => [$isSubModule ? 'nullable' : 'required', 'string', 'sanitize:text', 'max:255'],
            'details'     => ['nullable', 'string', 'sanitize:wp_kses_post'],
            'attachments' => ['nullable', 'array'],
            'attributes'  => ['nullable', 'array'],
        ];
    }
}
