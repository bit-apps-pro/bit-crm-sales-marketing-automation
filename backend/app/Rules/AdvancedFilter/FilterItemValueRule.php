<?php

namespace BitApps\Crm\Rules\AdvancedFilter;

use BitApps\Crm\Deps\BitApps\WPValidator\Rule;

class FilterItemValueRule extends Rule
{
    private $message = 'Invalid filter value!';

    public function __construct($customMessage = null)
    {
        if ($customMessage) {
            $this->message = $customMessage;
        }
    }

    public function validate($value)
    {
        return \is_string($value) || is_numeric($value) || \is_null($value) || \is_array($value);
    }

    public function message()
    {
        return $this->message;
    }
}
