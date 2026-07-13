<?php

namespace BitApps\Crm\HTTP\Requests\Activity;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Deps\BitApps\WPKit\Utils\Capabilities;

class UpdateStatusRequest extends Request
{
    // TODO: Uncomment the authorize method when capabilities are implemented
    // public function authorize()
    // {
    //     return Capability::check('cap');
    // }

    public function rules()
    {
        return [
            'id' => ['required', 'integer']
        ];
    }
}
