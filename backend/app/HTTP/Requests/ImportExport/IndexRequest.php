<?php

namespace BitApps\Crm\HTTP\Requests\ImportExport;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Rules\ValidModuleRule;
use BitApps\Crm\src\Capability;

class IndexRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_setting_data_management');
    }

    public function rules()
    {
        return [
            'page'    => ['nullable', 'integer'],
            'perPage' => ['nullable', 'integer'],
            'module'  => ['nullable', 'string', new ValidModuleRule()],
            'type'    => ['required', 'string', 'sanitize:text'],
        ];
    }
}
