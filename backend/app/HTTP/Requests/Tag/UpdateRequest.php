<?php

namespace BitApps\Crm\HTTP\Requests\Tag;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Model\Tag;
use BitApps\Crm\Rules\UniqueTagByModuleRule;
use BitApps\Crm\src\Capability;

class UpdateRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_tag_update');
    }

    public function failedAuthorizationMessage()
    {
        return __('Authorization Error: You don\'t have access!', 'bit-crm');
    }

    public function rules()
    {
        return [
            'id'    => ['required', 'integer'],
            'title' => [
                'required',
                'string',
                'sanitize:text',
                (new UniqueTagByModuleRule(Tag::class, 'title', __('Tag already exists for the module!', 'bit-crm')))->ignore($this->get('id')),
            ],
            'module' => ['nullable', 'string', 'sanitize:text']
        ];
    }
}
