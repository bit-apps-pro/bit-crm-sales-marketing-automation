<?php

namespace BitApps\Crm\src\Imap;

use BitApps\Crm\Services\ImapService;

class ImapFactory
{
    public static function getImapClientInstance(string $email, int $imapSettingsId, ?int $afterUid = null)
    {
        if (!$imapSettings = ImapService::getImapSettingsById($imapSettingsId)) {
            return ['success' => false, 'message' => __('Failed to fetch messages, please setup IMAP first.', 'bit-crm')];
        }

        $platform = $imapSettings['platform'];

        switch ($platform) {
            case 'zoho':
                return new Zoho($imapSettings, $email, $afterUid);

            case 'gmail':
                return new Gmail($imapSettings, $email, $afterUid);

            case 'other':
                return new OtherClient($imapSettings, $email, $afterUid);
        }

        return ['success' => false, 'message' => __('Failed to get imap client, invalid platform.', 'bit-crm')];
    }
}
