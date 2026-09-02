<?php

namespace BitApps\Crm\HTTP\Requests\Media;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class DownloadMediaRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_menu');
    }

    public function rules()
    {
        return [
            'mediaId'  => ['required', 'integer'],
            'fileName' => ['required', 'string', 'sanitize:text'],
        ];
    }
}
