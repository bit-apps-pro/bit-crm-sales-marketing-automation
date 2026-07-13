<?php

namespace BitApps\Crm\Rules;

use BitApps\Crm\Deps\BitApps\WPValidator\Rule;
use BitApps\Crm\Services\ModuleService;

class ValidModuleRule extends Rule
{
    private $message = 'Invalid module!';

    public function __construct($customMessage = null)
    {
        if ($customMessage) {
            $this->message = $customMessage;
        }
    }

    public function validate($value)
    {
        return ModuleService::isValidModule($value);
    }

    public function message()
    {
        return $this->message;
    }
}
