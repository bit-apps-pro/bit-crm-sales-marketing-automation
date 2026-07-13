<?php

namespace BitApps\Crm\Helpers;

if (!defined('ABSPATH')) {
    exit;
}

class CaseConverter
{
    public static function camelToSnake($input)
    {
        return strtolower(preg_replace('/(?<!^)[A-Z]/', '_$0', $input));
    }
}
