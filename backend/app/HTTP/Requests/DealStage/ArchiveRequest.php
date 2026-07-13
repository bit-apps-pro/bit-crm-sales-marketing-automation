<?php

namespace BitApps\Crm\HTTP\Requests\DealStage;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class ArchiveRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_setting_deal');
    }

    public function rules()
    {
        return [
            'key' => ['required', 'string', 'sanitize:text'],
        ];
    }
}
