<?php

namespace BitApps\Crm\Utils;

class ArrUtils
{
    public static function uniqueTruthyValuesByKey(array $items, string $key): array
    {
        $values = [];

        foreach ($items as $item) {
            if (!empty($item[$key])) {
                $values[$item[$key]] = true;
            }
        }

        return array_keys($values);
    }
}
