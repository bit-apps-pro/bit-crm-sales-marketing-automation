<?php

namespace BitApps\Crm\Rules\Common;

use BitApps\Crm\Deps\BitApps\WPValidator\Rule;

/**
 * A product id from any catalogue: CRM products send a JSON number, Woo and
 * FluentCart send digits as a string, SureCart sends a Price UUID. Only ever
 * stored and compared, never used in arithmetic.
 */
class ProductIdRule extends Rule
{
    private const MAX_LENGTH = 255;

    private $message = 'The :attribute must be a product id';

    public function validate($value): bool
    {
        if (\is_int($value)) {
            return true;
        }

        if (!\is_string($value)) {
            return false;
        }

        $value = trim($value);

        return $value !== '' && \strlen($value) <= self::MAX_LENGTH;
    }

    public function message()
    {
        return $this->message;
    }
}
