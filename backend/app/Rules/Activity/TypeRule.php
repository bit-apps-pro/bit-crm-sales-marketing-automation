<?php

namespace BitApps\Crm\Rules\Activity;

use BitApps\Crm\Deps\BitApps\WPValidator\Rule;
use BitApps\Crm\Model\Activity;

class TypeRule extends Rule
{
    private $message = 'Invalid activity type!';

    public function __construct($customMessage = null)
    {
        if ($customMessage) {
            $this->message = $customMessage;
        }
    }

    public function validate($value)
    {
        return \in_array($value, Activity::TYPES, true);
    }

    public function message()
    {
        return $this->message;
    }
}
