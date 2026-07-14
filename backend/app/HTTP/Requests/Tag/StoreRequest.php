<?php

namespace BitApps\Crm\HTTP\Requests\Tag;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Model\Tag;
use BitApps\Crm\Rules\UniqueTagByModuleRule;
use BitApps\Crm\Rules\ValidModuleRule;
use BitApps\Crm\src\Capability;

class StoreRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_tag_create');
    }

    public function failedAuthorizationMessage()
    {
        return __('Authorization Error: You don\'t have access!', 'bit-crm-sales-marketing-automation');
    }

    public function rules()
    {
        return [
            'title' => [
                'required',
                'string',
                'sanitize:text',
                new UniqueTagByModuleRule(Tag::class, 'title', __('Tag already exists for the module!', 'bit-crm-sales-marketing-automation')),
            ],
            'module' => ['required', 'string', 'sanitize:text', new ValidModuleRule()]
        ];
    }
}
