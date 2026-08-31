<?php

namespace BitApps\Crm\Rules\Common;

use BitApps\Crm\Deps\BitApps\WPValidator\Rule;

/**
 * Allow-list for the sample CSV templates.
 *
 * The name is concatenated into a filesystem path, so it is matched against the
 * shipped templates rather than filtered: sanitize_text_field() leaves '../'
 * intact, and an allow-list keeps the path fixed no matter what arrives.
 */
class SampleFileNameRule extends Rule
{
    public const SAMPLE_FILE_NAMES = [
        'sample_entities',
        'sample_tags',
    ];

    private $message = 'Invalid sample file name!';

    public function __construct($customMessage = null)
    {
        if ($customMessage) {
            $this->message = $customMessage;
        }
    }

    public function validate($value)
    {
        return \is_string($value) && \in_array($value, self::SAMPLE_FILE_NAMES, true);
    }

    public function message()
    {
        return $this->message;
    }
}
