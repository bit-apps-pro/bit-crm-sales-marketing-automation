<?php

namespace BitApps\Crm\HTTP\Requests\Activity;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Deps\BitApps\WPKit\Utils\Capabilities;

class ActivityNotesRequest extends Request
{
    // TODO: Uncomment the authorize method when capabilities are implemented
    // public function authorize()
    // {
    //     return Capabilities::check('cap');
    // }

    public function rules()
    {
        return [
            'id'     => ['required', 'integer'],
            'module' => ['required', 'string', 'sanitize:text'],
        ];
    }
}
