<?php

namespace BitApps\Crm\Rules\Contact;

use BitApps\Crm\Deps\BitApps\WPValidator\Rule;

class FiltersRule extends Rule
{
    private $message = 'Invalid filters!';

    public function __construct($customMessage = null)
    {
        if ($customMessage) {
            $this->message = $customMessage;
        }
    }

    public function validate($value)
    {
        if (\is_array($value)) {
            foreach ($value as $key => $item) {
                if (!\is_string($key) || empty($item) || !\is_string($item)) {
                    return false;
                }
            }

            return true;
        }

        return false;
    }

    public function message()
    {
        return $this->message;
    }
}
