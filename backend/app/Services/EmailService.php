<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Constants\CommonConstant;
use BitApps\Crm\Factories\EntityFactory;
use BitApps\Crm\src\Imap\Messages;
use Throwable;

class EmailService
{
    public static function getEmailBody($emailData)
    {
        $imapMessages = new Messages($emailData['entity_email'], $emailData['imap_id']);

        if ($emailData['email_direction'] === CommonConstant::EMAIL_DIRECTION_RECEIVED) {
            $msg = $imapMessages->getReceivedMessageByUid($emailData['email_uid']);
        } else {
            $msg = $imapMessages->getSentMessageByUid($emailData['email_uid']);
        }

        if (empty($msg) || (\is_array($msg) && isset($msg['success']) && !$msg['success'])) {
            return false;
        }

        if ($msg->hasHTMLBody()) {
            $body = $msg->getHTMLBody();
        } else {
            $body = $msg->getTextBody();
        }

        return $body;
    }

    public function processAttachments(array $attachments)
    {
        $filePaths = [];

        foreach ($attachments as $attachment) {
            if (empty($attachment['media_id'])) {
                continue;
            }

            $filePath = get_attached_file($attachment['media_id']);

            if ($filePath && file_exists($filePath)) {
                $filePaths[] = $filePath;
            }
        }

        return $filePaths;
    }

    public function formatMessage($message, $entityId, $module)
    {
        if (empty($message) || empty($entityId) || empty($module)) {
            return $message;
        }

        try {
            $entityData = EntityFactory::module($module)->findById($entityId);
        } catch (Throwable $th) {
            return $message;
        }

        return EntityFieldService::renderFieldsInHtml($message, $entityData);
    }
}
