<?php

namespace BitApps\Crm\Helpers;

use DateTimeZone;

final class DateTime
{
    /**
     * Get the current site's time zone offset in +hh:mm or -hh:mm format.
     *
     * If the site uses a named time zone (e.g., 'America/New_York', 'Asia/Dhaka'),
     * the function will calculate the offset in +hh:mm or -hh:mm format based on the site's current time zone.
     * If the time zone string is not available, it falls back to using the site's gmt_offset.
     *
     * @return string Time zone offset in the format +hh:mm or -hh:mm (e.g., +05:00, -04:00)
     */
    public static function getSiteTimezoneOffset(): string
    {
        if (!\function_exists('wp_timezone_string')) {
            return self::getTimezoneOffsetFromGmt();
        }

        $timezone = wp_timezone();

        if (self::inferTimezoneType($timezone) === 1) {
            return $timezone->getName();
        }

        $datetime = new \DateTime('now', $timezone);

        $offsetSeconds = $timezone->getOffset($datetime);
        $offsetHours = (int) ($offsetSeconds / 3600);
        $offsetMinutes = abs((int) (($offsetSeconds % 3600) / 60));

        return \sprintf('%+03d:%02d', $offsetHours, $offsetMinutes);
    }

    public static function inferTimezoneType(DateTimeZone $tz)
    {
        $name = $tz->getName();

        $type = 3;

        if (preg_match('/^[\+\-]/', $name)) {
            $type = 1;
        } elseif (\strlen($name) === 3) {
            $type = 2;
        }

        return $type;
    }

    public static function getTimezoneOffsetFromGmt(): string
    {
        $offset = (float) get_option('gmt_offset');
        $sign = ($offset < 0) ? '-' : '+';
        $hours = abs(\intval($offset / 3600));
        $minutes = abs(\intval(($offset % 3600) / 60));

        return \sprintf('%s%02d:%02d', $sign, $hours, $minutes);
    }
}
