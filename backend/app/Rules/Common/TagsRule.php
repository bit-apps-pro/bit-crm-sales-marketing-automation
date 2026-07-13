<?php

namespace BitApps\Crm\Rules\Common;

use BitApps\Crm\Deps\BitApps\WPValidator\Rule;

class TagsRule extends Rule
{
    private $message = 'Invalid tags!';

    public function __construct($customMessage = null)
    {
        if ($customMessage) {
            $this->message = $customMessage;
        }
    }

    public function validate($value)
    {
        if (!\is_array($value)) {
            return false;
        }

        foreach ($value as $tag) {
            if (!$this->isIntegerLike($tag)) {
                return false;
            }
        }

        return true;
    }

    public function message()
    {
        return $this->message;
    }

    private function isIntegerLike($value): bool
    {
        if (\is_int($value)) {
            return true;
        }

        return (bool) (\is_string($value) && ctype_digit($value));
    }
}
