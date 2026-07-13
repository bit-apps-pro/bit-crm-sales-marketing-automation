<?php

namespace BitApps\Crm\HTTP\Requests\PluginInstaller;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class InstallRequest extends Request
{
    public function authorize()
    {
        return Capability::check('install_plugins');
    }

    public function rules()
    {
        return [
            'slug' => ['required', 'string', 'sanitize:text'],
        ];
    }
}
