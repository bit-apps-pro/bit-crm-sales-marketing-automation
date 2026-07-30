<?php

namespace BitApps\Crm\HTTP\Requests\Activity;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class ActivityNotesRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_note_view');
    }

    public function rules()
    {
        return [
            'id'            => ['required', 'integer'],
            'module'        => ['required', 'string', 'sanitize:text'],
            'submoduleType' => ['required', 'string', 'sanitize:text'],
        ];
    }
}
