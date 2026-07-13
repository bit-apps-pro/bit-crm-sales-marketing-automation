<?php

namespace BitApps\Crm\src\Imap;

use BitApps\Crm\Deps\Webklex\PHPIMAP\Client;
use BitApps\Crm\Deps\Webklex\PHPIMAP\ClientManager;

class ClientManagerConfig extends ClientManager
{
    public function __construct($config = [])
    {
        $this->setConfig($config);
    }

    public function setConfig($config): ClientManager
    {
        if (!$config instanceof CustomConfig) {
            $config = CustomConfig::make($config);
        }

        $this->config = $config;

        return $this;
    }

    public function make(array $config): Client
    {
        $name = $this->config->getDefaultAccount();
        $clientConfig = $this->config->all();
        $clientConfig['accounts'] = [$name => $config];

        return new Client(CustomConfig::make($clientConfig));
    }
}
