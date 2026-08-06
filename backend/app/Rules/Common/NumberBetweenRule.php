<?php

namespace BitApps\Crm\Rules\Common;

use BitApps\Crm\Deps\BitApps\WPValidator\Rule;

class NumberBetweenRule extends Rule
{
    private $min;

    private $max;

    private $message;

    public function __construct($min, $max, $customMessage = null)
    {
        $this->min = $min;
        $this->max = $max;
        $this->message = $customMessage;
    }

    public function validate($value)
    {
        if (!is_numeric($value)) {
            return false;
        }

        return $value >= $this->min && $value <= $this->max;
    }

    public function message()
    {
        if ($this->message) {
            return $this->message;
        }

        // translators: 1: minimum value, 2: maximum value
        return \sprintf(__('The :attribute must be between %1$s and %2$s.', 'bit-crm-sales-marketing-automation'), $this->min, $this->max);
    }
}
