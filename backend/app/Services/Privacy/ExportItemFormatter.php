<?php

namespace BitApps\Crm\Services\Privacy;

/**
 * Shapes values and items for the WordPress personal-data exporter.
 *
 * Shared by the free exporter and by anything extending the export through
 * HookKeys::PRIVACY_EXPORT_GROUPS (the pro plugin), so every group in the
 * export is formatted the same way.
 */
class ExportItemFormatter
{
    public const GROUP_PREFIX = 'bit-crm-';

    /**
     * Shapes one WordPress exporter item.
     *
     * @param array<int, array{name: string, value: string}> $data
     */
    public function buildItem(string $groupKey, string $groupLabel, string $groupDescription, string $itemKey, array $data): array
    {
        return [
            'group_id'          => self::GROUP_PREFIX . $groupKey,
            'group_label'       => $groupLabel,
            'group_description' => $groupDescription,
            'item_id'           => self::GROUP_PREFIX . $itemKey,
            'data'              => $data,
        ];
    }

    /**
     * @param array<string, mixed> $pairs label => value; empty values are dropped
     *
     * @return array<int, array{name: string, value: string}>
     */
    public function buildPairs(array $pairs): array
    {
        $data = [];

        foreach ($pairs as $name => $value) {
            $value = $this->formatValue($value);

            if ($value === '') {
                continue;
            }

            $data[] = ['name' => (string) $name, 'value' => $value];
        }

        return $data;
    }

    /**
     * Renders one stored value for the export. Field options (select, radio)
     * resolve to their label so the export reads like the UI.
     *
     * @param mixed $value
     */
    public function formatValue($value, ?array $options = null): string
    {
        if ($value === null || $value === '' || $value === []) {
            return '';
        }

        if (\is_bool($value)) {
            return $value ? __('Yes', 'bit-crm-sales-marketing-automation') : __('No', 'bit-crm-sales-marketing-automation');
        }

        if (\is_array($value)) {
            $flat = array_filter(array_map(fn ($v) => \is_scalar($v) ? (string) $v : wp_json_encode($v), $value), 'strlen');

            return implode(', ', $flat);
        }

        $value = (string) $value;

        if (!empty($options)) {
            foreach ($options as $option) {
                if (\is_array($option) && isset($option['value'], $option['label']) && (string) $option['value'] === $value) {
                    return (string) $option['label'];
                }
            }
        }

        return $value;
    }

    /**
     * A list stored as JSON or array (recipient addresses), comma separated.
     *
     * @param mixed $value
     */
    public function formatList($value): string
    {
        if (\is_string($value)) {
            $decoded = json_decode($value, true);
            $value = \is_array($decoded) ? $decoded : [$value];
        }

        return $this->formatValue($value);
    }

    /**
     * Rich text (notes, email bodies) as plain text on one line.
     *
     * @param mixed $value
     */
    public function formatText($value): string
    {
        if (!\is_string($value) || $value === '') {
            return '';
        }

        return trim(preg_replace('/\s+/u', ' ', wp_strip_all_tags($value, true)) ?? '');
    }

    /**
     * Trims the padding decimals the ORM returns ("200000.0000" => "200000").
     *
     * @param mixed $value
     */
    public function formatNumber($value): string
    {
        if (!is_numeric($value)) {
            return (string) $value;
        }

        $formatted = rtrim(rtrim(\sprintf('%.4F', (float) $value), '0'), '.');

        return $formatted === '' || $formatted === '-' ? '0' : $formatted;
    }
}
