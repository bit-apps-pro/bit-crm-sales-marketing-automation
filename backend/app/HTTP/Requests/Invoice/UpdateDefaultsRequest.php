<?php

namespace BitApps\Crm\HTTP\Requests\Invoice;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class UpdateDefaultsRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_setting_invoice');
    }

    public function rules()
    {
        return [
            'top_section_notes'            => ['nullable', 'array'],
            'top_section_notes.*.label'    => ['nullable', 'string', 'sanitize:wp_kses_post'],
            'top_section_notes.*.value'    => ['nullable', 'string', 'sanitize:wp_kses_post'],
            'bottom_section_notes'         => ['nullable', 'array'],
            'bottom_section_notes.*.label' => ['nullable', 'string', 'sanitize:wp_kses_post'],
            'bottom_section_notes.*.value' => ['nullable', 'string', 'sanitize:wp_kses_post'],
        ];
    }
}
