<?php

namespace BitApps\Crm\HTTP\Requests\BitForm;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class CreateFormRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_setting_integration');
    }

    public function rules()
    {
        return [
            'title'              => ['required', 'string', 'sanitize:text', 'max:50'],
            'templateSlug'       => ['nullable', 'string', 'sanitize:text'],
            'crm'                => ['nullable', 'array'],
            'crm.tagIds'         => ['nullable', 'array'],
            'crm.tagIds.*'       => ['nullable', 'integer'],
            'crm.newTagTitles'   => ['nullable', 'array'],
            'crm.newTagTitles.*' => ['nullable', 'string', 'sanitize:text'],
            'crm.fieldMap'       => ['nullable', 'array'],
            'returnUrl'          => ['nullable', 'string'],
            'closeAfterCreate'   => ['nullable', 'boolean'],
        ];
    }
}
