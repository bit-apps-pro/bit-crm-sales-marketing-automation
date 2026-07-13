<?php

namespace BitApps\Crm\Helpers;

final class SQLHelper
{
    /**
     * Converts a column to a date in the site's timezone.
     *
     * @param string $column the column to convert
     * @param null|string $alias optional alias for the converted column
     *
     * @return string the SQL expression for converting the column to a date in the site's timezone
     */
    public static function utcToSiteDate(string $column, ?string $alias = null): string
    {
        $timezoneOffset = DateTime::getSiteTimezoneOffset();

        $aliasPart = $alias ? " AS {$alias}" : '';

        return "DATE(CONVERT_TZ({$column}, '+00:00', '" . esc_sql($timezoneOffset) . "'))" . $aliasPart;
    }

    /**
     * Converts a column to a datetime in the site's timezone.
     *
     * @param string $column the column to convert
     * @param null|string $alias optional alias for the converted column
     *
     * @return string the SQL expression for converting the column to a datetime in the site's timezone
     */
    public static function utcToSiteDateTime(string $column, ?string $alias = null): string
    {
        $timezoneOffset = DateTime::getSiteTimezoneOffset();

        $aliasPart = $alias ? " AS {$alias}" : '';

        return "CONVERT_TZ({$column}, '+00:00', '" . esc_sql($timezoneOffset) . "')" . $aliasPart;
    }
}
