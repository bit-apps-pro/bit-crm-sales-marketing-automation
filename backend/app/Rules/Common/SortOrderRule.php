<?php

namespace BitApps\Crm\Rules\Common;

use BitApps\Crm\Deps\BitApps\WPValidator\Rule;

class SortOrderRule extends Rule
{
    private $message = 'Invalid sort order!';

    public function __construct($customMessage = null)
    {
        if ($customMessage) {
            $this->message = $customMessage;
        }
    }

    public function validate($value)
    {
        $orders = ['asc', 'desc'];

        return (bool) (\is_string($value) && \in_array(strtolower($value), $orders));
    }

    public function message()
    {
        return $this->message;
    }
}
