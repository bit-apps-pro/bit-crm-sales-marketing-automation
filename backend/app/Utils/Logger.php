<?php

namespace BitApps\Crm\Utils;

use BitApps\Crm\Config;
use Throwable;

class Logger
{
    public static function error($message, array $context = []): void
    {
        self::log('ERROR', $message, $context);
    }

    public static function debug($message, array $context = []): void
    {
        self::log('DEBUG', $message, $context);
    }

    private static function log(string $level, $message, array $context = []): void
    {
        if (!Config::getEnv('DEV')) {
            return;
        }

        if ($message instanceof Throwable) {
            $message = [
                'message' => $message->getMessage(),
                'file'    => $message->getFile(),
                'line'    => $message->getLine(),
                'trace'   => $message->getTraceAsString()
            ];
        }

        $formatted = '[' . Config::TITLE . '][' . $level . '] ' . wp_json_encode($message, JSON_PRETTY_PRINT);

        if (!empty($context)) {
            $formatted .= ' | Context: ' . wp_json_encode($context, JSON_PRETTY_PRINT);
        }

        // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- This is the plugin's logging utility
        error_log($formatted);
    }
}
