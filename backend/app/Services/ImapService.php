<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Config;
use BitApps\Crm\Constants\CommonConstant;
use BitApps\Crm\Deps\BitApps\WPKit\Helpers\Arr;
use BitApps\Crm\Helpers\Hash;
use BitApps\Crm\Model\Email;
use BitApps\Crm\Model\ImapSetting;
use BitApps\Crm\src\Imap\Gmail;
use BitApps\Crm\src\Imap\Zoho;
use Throwable;

class ImapService
{
    public static function isExists($userName, $host, $ignoreId = null): bool
    {
        $query = ImapSetting::where('username', $userName)
            ->where('host', $host);

        if ($ignoreId) {
            $query->where('id', '!=', $ignoreId);
        }

        $result = $query->count();

        return !\is_null($result) && $result > 0;
    }

    public static function getCommonImapConfigByPlatform(string $platform): array
    {
        $config = ['protocol' => 'imap', 'port' => 993, 'encryption' => 'ssl'];

        switch ($platform) {
            case 'zoho':
                $config['host'] = Zoho::IMAP_HOST;

                break;

            case 'gmail':
                $config['host'] = Gmail::IMAP_HOST;

                break;

            default:
                return [];
        }

        return $config;
    }

    public static function getImapSettingsById(int $id)
    {
        if (!$id) {
            return false;
        }

        $imapSettings = ImapSetting::where('id', $id)
            ->select(['platform', 'username', 'app_password', 'host', 'port', 'encryption'])
            ->first();

        if ($imapSettings) {
            $imapSettings = $imapSettings->getAttributes();

            if (isset($imapSettings['app_password'])) {
                $imapSettings['app_password'] = Hash::decrypt($imapSettings['app_password']);
            }

            return $imapSettings;
        }

        return false;
    }

    public static function getStoredMessageIds($email, $imapId)
    {
        try {
            $uids = Email::where('entity_email', $email)
                ->where(
                    function ($query) use ($imapId) {
                        $query->where('imap_id', $imapId)->orWhere('imap_id', null);
                    }
                )
                ->select(['message_id'])
                ->get();
        } catch (Throwable $th) {
            return [];
        }

        return Arr::pluck($uids, 'message_id');
    }

    public static function getLatestEmailUid($entityEmail, $imapId)
    {
        return Email::where('entity_email', $entityEmail)
            ->where('imap_id', $imapId)
            ->max('email_uid');
    }

    public static function getFetchStatus(string $batchKey): array
    {
        $directions = [
            CommonConstant::EMAIL_DIRECTION_RECEIVED,
            CommonConstant::EMAIL_DIRECTION_SENT,
        ];

        $statuses = [];

        foreach ($directions as $direction) {
            $optionName = ImapSetting::FETCH_STATUS_OPTION_NAME . '_' . $batchKey . '_' . $direction;
            $statuses[$direction] = Config::getOption($optionName, ImapSetting::STATUS_FETCH_IDLE);
        }

        if (\in_array(ImapSetting::STATUS_FETCH_PROCESSING, $statuses, true)) {
            $fetchStatus = ImapSetting::STATUS_FETCH_PROCESSING;
        } elseif (\in_array(ImapSetting::STATUS_FETCH_ERROR, $statuses, true)) {
            $fetchStatus = ImapSetting::STATUS_FETCH_ERROR;
        } elseif (
            $statuses[CommonConstant::EMAIL_DIRECTION_RECEIVED] === ImapSetting::STATUS_FETCH_COMPLETED
            && $statuses[CommonConstant::EMAIL_DIRECTION_SENT] === ImapSetting::STATUS_FETCH_COMPLETED
        ) {
            $fetchStatus = ImapSetting::STATUS_FETCH_COMPLETED;
        } else {
            $fetchStatus = ImapSetting::STATUS_FETCH_IDLE;
        }

        return [$fetchStatus, $directions];
    }
}
