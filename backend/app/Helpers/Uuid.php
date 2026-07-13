<?php

namespace BitApps\Crm\Helpers;

final class Uuid
{
    /**
     * Generates a random UUID (version 4).
     *
     * @since 4.7.0
     *
     * @return string UUID
     */
    public static function generate(): string
    {
        return wp_generate_uuid4();
    }

    /**
     * Convert UUID string to 16-byte binary (for storing in MySQL BINARY(16)).
     *
     * @param string $uuid UUIDv4 string
     *
     * @return string 16-byte binary string
     */
    public static function uuidToBinary(string $uuid): string
    {
        return pack('H*', str_replace('-', '', $uuid));
    }

    /**
     * Convert 16-byte binary back to UUID string.
     *
     * @return string UUIDv4 string
     */
    public static function binaryToUuid(string $value): string
    {
        if (self::isUuid($value)) {
            return $value;
        }

        $hex = unpack('H*', $value)[1];

        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split($hex, 4));
    }

    public static function toggleFormat($value)
    {
        return self::isUuid($value) ? self::uuidToBinary($value) : self::binaryToUuid($value);
    }

    public static function isUuid($id): bool
    {
        $pattern = '/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i';

        return preg_match($pattern, $id);
    }
}
