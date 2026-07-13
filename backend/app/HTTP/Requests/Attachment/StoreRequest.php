<?php

namespace BitApps\Crm\HTTP\Requests\Attachment;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Rules\ValidModuleRule;

class StoreRequest extends Request
{
    // TODO: Uncomment the authorize method when capabilities are implemented
    // public function authorize()
    // {
    //     return Capability::check('cap');
    // }

    public function rules()
    {
        return [
            'attachments.*.media_id'           => ['required', 'integer'],
            'attachments.*.media_url'          => ['required', 'string', 'sanitize:text'],
            'attachments.*.file_name'          => ['required', 'string', 'sanitize:text'],
            'attachments.*.mime'               => ['required', 'string', 'sanitize:text'],
            'attachments.*.file_size_in_bytes' => ['required', 'integer'],
            'entity_id'                        => ['required', 'integer'],
            'module'                           => ['required', 'string', 'sanitize:text', new ValidModuleRule()],
        ];
    }
}
