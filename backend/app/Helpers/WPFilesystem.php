<?php

namespace BitApps\Crm\Helpers;

use BadMethodCallException;
use RuntimeException;
use WP_Filesystem_Base;

final class WPFilesystem
{
    private WP_Filesystem_Base $fs;

    public function __construct()
    {
        global $wp_filesystem;

        if (!$wp_filesystem instanceof WP_Filesystem_Base) {
            include_once ABSPATH . 'wp-admin/includes/file.php';

            if (!WP_Filesystem() || !$wp_filesystem instanceof WP_Filesystem_Base) {
                throw new RuntimeException('Unable to initialize WP_Filesystem');
            }
        }

        $this->fs = $wp_filesystem;
    }

    public function __call(string $method, array $args)
    {
        if (!method_exists($this->fs, $method)) {
            throw new BadMethodCallException(\sprintf('Invalid WP_Filesystem method: %s', esc_html($method)));
        }

        return $this->fs->{$method}(...$args);
    }

    public static function __callStatic(string $method, array $args)
    {
        $instance = new self();

        return $instance->__call($method, $args);
    }
}
