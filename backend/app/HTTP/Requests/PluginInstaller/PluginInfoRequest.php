<?php

namespace BitApps\Crm\HTTP\Requests\PluginInstaller;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;

class PluginInfoRequest extends Request
{
    public function rules()
    {
        return [
            'slug' => ['required', 'string', 'sanitize:text'],
        ];
    }
}
