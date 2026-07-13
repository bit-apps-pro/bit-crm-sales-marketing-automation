<?php

namespace BitApps\Crm\src\Imap;

class OtherClient extends BaseImap
{
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
