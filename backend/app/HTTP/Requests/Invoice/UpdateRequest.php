<?php

namespace BitApps\Crm\HTTP\Requests\Invoice;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class UpdateRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_invoice_update');
    }

    public function rules()
    {
        return [
            'id'                               => ['required', 'integer'],
            'invoice_date'                     => ['required', 'string'],
            'due_date'                         => ['required', 'string'],
            'gross_discount_amount'            => ['nullable', 'numeric'],
            'gross_discount_type'              => ['nullable', 'string'],
            'term_key'                         => ['required', 'string'],
            'invoice_prefix'                   => ['required', 'string', 'sanitize:text'],
            'top_section_notes'                => ['nullable', 'array'],
            'top_section_notes.*.label'        => ['nullable', 'string', 'sanitize:wp_kses_post'],
            'top_section_notes.*.value'        => ['nullable', 'string', 'sanitize:wp_kses_post'],
            'status'                           => ['nullable', 'string'],
            'bottom_section_notes'             => ['nullable', 'array'],
            'bottom_section_notes.*.label'     => ['nullable', 'string', 'sanitize:wp_kses_post'],
            'bottom_section_notes.*.value'     => ['nullable', 'string', 'sanitize:wp_kses_post'],
            'tax_option'                       => ['required', 'string'],
            'currency'                         => ['required', 'string'],
            'line_items'                       => ['required', 'array'],
            'line_items.*.product_name'        => ['nullable', 'string', 'sanitize:text'],
            'line_items.*.unit_price'          => ['nullable', 'numeric'],
            'line_items.*.quantity'            => ['nullable', 'integer'],
            'line_items.*.discount_percentage' => ['nullable', 'integer'],
            'line_items.*.tax_rate'            => ['nullable', 'integer'],
            'line_items.*.product_code'        => ['nullable', 'string', 'sanitize:text'],
            'line_items.*.product_source'      => ['nullable', 'string', 'sanitize:text'],
            'line_items.*.description'         => ['nullable', 'string', 'sanitize:text'],
            'line_items.*.product_id'          => ['nullable', 'integer'],
        ];
    }
}
