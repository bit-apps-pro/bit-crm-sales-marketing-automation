<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Model\Setting;

class FieldService
{
    public const GROUP_FIELDS_ARRAY_KEY = 'group_fields';

    public static function mergeSystemFieldsWithDb(array $systemFields, string $settingsKey, array $groupKeys = []): array
    {
        $FiledsSettings = Setting::findOne(['setting_key' => $settingsKey]);

        if (!$FiledsSettings) {
            return $systemFields;
        }

        $settingsValue = $FiledsSettings->setting_value;

        if (!empty($settingsValue) && \is_array($settingsValue)) {
            foreach ($settingsValue as $key => $value) {
                if (\array_key_exists($key, $systemFields)) {
                    $systemFields[$key] = array_merge($systemFields[$key], $value);

                    continue;
                }

                self::mergeOnGroupFields($groupKeys, $systemFields, $key, $value);
            }
        }

        return $systemFields;
    }

    public static function extractFieldKeys(array $fields): array
    {
        $keys = [];

        foreach ($fields as $field) {
            if (($field['type'] ?? '') === 'section') {
                continue;
            }

            if (isset($field[FieldService::GROUP_FIELDS_ARRAY_KEY])) {
                array_push($keys, ...self::extractFieldKeys($field[FieldService::GROUP_FIELDS_ARRAY_KEY]));

                continue;
            }

            $keys[] = $field['field_key'];
        }

        return $keys;
    }

    private static function mergeOnGroupFields(array $groupKeys, array &$systemFields, string $key, array $value)
    {
        if (empty($groupKeys)) {
            return;
        }

        $fieldsArrayKey = self::GROUP_FIELDS_ARRAY_KEY;

        foreach ($groupKeys as $groupKey) {
            if (\array_key_exists($groupKey, $systemFields) && \array_key_exists($key, $systemFields[$groupKey][$fieldsArrayKey])) {
                $systemFields[$groupKey][$fieldsArrayKey][$key] = array_merge($systemFields[$groupKey][$fieldsArrayKey][$key], $value);

                break;
            }
        }
    }
}
