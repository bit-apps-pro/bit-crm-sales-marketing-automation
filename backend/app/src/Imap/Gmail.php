<?php

namespace BitApps\Crm\src\Imap;

class Gmail extends BaseImap
{
    public const IMAP_HOST = 'imap.gmail.com';

    public function __construct(array $clientConfig, string $emailAddress, ?int $uidAfter = null)
    {
        $this->clientConfig = $clientConfig;
        $this->emailAddress = $emailAddress;
        $this->uidAfter = $uidAfter;
        $this->sentFolder = $this->receivedFolder = 'All Mail';

        parent::__construct();
    }
}
