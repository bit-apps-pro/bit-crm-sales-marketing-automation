<?php

namespace BitApps\Crm\src\Imap;

use BitApps\Crm\Deps\Webklex\PHPIMAP\Config;
use BitApps\Crm\Deps\Webklex\PHPIMAP\Decoder\AttachmentDecoder;
use BitApps\Crm\Deps\Webklex\PHPIMAP\Decoder\DecoderInterface;
use BitApps\Crm\Deps\Webklex\PHPIMAP\Decoder\HeaderDecoder;
use BitApps\Crm\Deps\Webklex\PHPIMAP\Decoder\MessageDecoder;
use BitApps\Crm\Deps\Webklex\PHPIMAP\Exceptions\DecoderNotFoundException;
use BitApps\Crm\ImapConfig;

class CustomConfig extends Config
{
    public static function make(array|string $config = []): Config
    {
        if (\is_array($config) === false) {
            $config = include $config;
        }

        $imapConfig = ImapConfig::getConfig();

        if (!empty($config)) {
            $config = self::arrayMergeRecursiveDistinct($imapConfig, $config);
        } else {
            $config = $imapConfig;
        }

        if (\is_array($config) && isset($config['default'], $config['accounts']) && $config['default']) {
            $defaultConfig = $imapConfig['accounts']['default'];

            if (isset($config['accounts'][$config['default']])) {
                $defaultConfig = array_merge($defaultConfig, $config['accounts'][$config['default']]);
            }

            if (\is_array($config['accounts'])) {
                foreach ($config['accounts'] as $accountKey => $account) {
                    $config['accounts'][$accountKey] = array_merge($defaultConfig, $account);
                }
            }
        }

        return new self($config);
    }

    public function getDecoder(string $name): DecoderInterface
    {
        $defaultDecoders = $this->get(
            'decoding.decoder',
            [
                'header'     => HeaderDecoder::class,
                'message'    => MessageDecoder::class,
                'attachment' => AttachmentDecoder::class
            ]
        );

        $options = $this->get(
            'decoding.options',
            [
                'header'     => 'utf-8',
                'message'    => 'utf-8',
                'attachment' => 'utf-8',
            ]
        );

        if (isset($defaultDecoders[$name])) {
            if (class_exists($defaultDecoders[$name])) {
                return new $defaultDecoders[$name]($options);
            }
        }

        throw new DecoderNotFoundException();
    }

    private static function arrayMergeRecursiveDistinct(): array
    {
        $arrays = \func_get_args();
        $base = array_shift($arrays);

        // From https://stackoverflow.com/a/173479
        $isAssoc = function (array $arr) {
            if ($arr === []) {
                return false;
            }

            return array_keys($arr) !== range(0, \count($arr) - 1);
        };

        if (!\is_array($base)) {
            $base = empty($base) ? [] : [$base];
        }

        foreach ($arrays as $append) {
            if (!\is_array($append)) {
                $append = [$append];
            }

            foreach ($append as $key => $value) {
                if (!\array_key_exists($key, $base) and !is_numeric($key)) {
                    $base[$key] = $value;

                    continue;
                }

                if ((\is_array($value) && $isAssoc($value)) || (\is_array($base[$key]) && $isAssoc($base[$key]))) {
                    // If the arrays are not associates we don't want to arrayMergeRecursiveDistinct
                    // else merging $baseConfig['dispositions'] = ['attachment', 'inline'] with $customConfig['dispositions'] = ['attachment']
                    // results in $resultConfig['dispositions'] = ['attachment', 'inline']
                    $base[$key] = self::arrayMergeRecursiveDistinct($base[$key], $value);
                } elseif (is_numeric($key)) {
                    if (!\in_array($value, $base)) {
                        $base[] = $value;
                    }
                } else {
                    $base[$key] = $value;
                }
            }
        }

        return $base;
    }
}
