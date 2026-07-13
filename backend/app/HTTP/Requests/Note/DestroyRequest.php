<?php

namespace BitApps\Crm\HTTP\Requests\Note;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;

class DestroyRequest extends Request
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
