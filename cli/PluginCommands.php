<?php

namespace BitApps\Crm\CLI;

use WP_CLI;

// require_once( ABSPATH . 'wp-admin/includes/plugin.php' );
include_once ABSPATH . 'wp-admin/includes/plugin.php';
class PluginCommands
{
    public const DEV = 'DEV';

    public function toggleDev($_, $assocArgs)
    {
        if (!isset($assocArgs['active'])) {
            WP_CLI::error('missing parameter use wp bit-crm-sales-marketing-automation use toggleDev --active=y|n');

            return;
        }

        $flag = strtolower($assocArgs['active']) === 'y' ? true : false;

        $this->setEnv(self::DEV, $flag);

        WP_CLI::success(\sprintf('The %s constant is %s.', self::DEV, $flag ? 'Enable' : 'Disable'));
    }

    private function setEnv($key, $flag)
    {
        $envFilePath = realpath(__DIR__ . DIRECTORY_SEPARATOR . '../.env');

        $lines = file($envFilePath, FILE_IGNORE_NEW_LINES);

        $value = $flag ? 'true' : 'false';

        $pattern = "/^{$key}\\s*=\\s*(.*)/m";

        $envKeyValue = "{$key} = {$value}";

        $found = false;

        foreach ($lines as &$line) {
            if (preg_match($pattern, $line)) {
                $line = $envKeyValue;
                $found = true;

                break;
            }
        }

        unset($line);

        if (!$found) {
            $lines[] = $envKeyValue;
        }

        $envData = implode("\n", $lines);

        $isContentUpdated = file_put_contents($envFilePath, $envData);

        if ($isContentUpdated === false) {
            WP_CLI::error(\sprintf('Error writing to the file %s!', $isContentUpdated));

            exit;
        }

        return $isContentUpdated;
    }
}
