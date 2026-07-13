<?php

namespace BitApps\Crm\src\Imap;

class Zoho extends BaseImap
{
    public const IMAP_HOST = 'imappro.zoho.com';

    public function __construct(array $clientConfig, string $emailAddress, ?int $uidAfter = null)
    {
        $this->clientConfig = $clientConfig;
        $this->emailAddress = $emailAddress;
        $this->uidAfter = $uidAfter;
        $this->sentFolder = 'Sent';
        $this->receivedFolder = 'INBOX';

        parent::__construct();
    }
}
