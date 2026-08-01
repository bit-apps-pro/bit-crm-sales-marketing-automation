<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Config;
use BitApps\Crm\Constants\CommonConstant;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Factories\EntityFactory;
use BitApps\Crm\HTTP\Requests\Email\SendRequest;
use BitApps\Crm\Model\Email;
use BitApps\Crm\src\Imap\Messages;
use Throwable;

class EmailService
{
    /**
     * @param string[] $filePaths server-generated attachments (e.g. invoice PDFs) that are sent but not stored
     */
    public function send(array|Request $data, array $filePaths = []): array
    {
        $rules = (new SendRequest())->rules();
        $validated = CommonService::resolveValidatedData($data, $rules);

        if (isset($validated['errors'])) {
            return $validated;
        }

        $formattedAttachments = array_merge($this->processAttachments($validated['attachments'] ?? []), $filePaths);
        $message = $this->formatMessage($validated['message'], $validated['entity_id'], $validated['module']);
        $headers = ['Content-Type: text/html; charset=UTF-8'];

        $phpMailer = null;

        Hooks::addAction(
            'phpmailer_init',
            function ($mailer) use (&$phpMailer) {
                $phpMailer = $mailer;
            }
        );

        $sent = wp_mail($validated['entity_email'], $validated['subject'], $message, $headers, $formattedAttachments);

        if (!$sent) {
            return ['success' => false, 'errors' => [__('Failed to send email.', 'bit-crm-sales-marketing-automation')]];
        }

        $messageId = $this->getMessageId($phpMailer);

        if (!$messageId) {
            return ['success' => false, 'errors' => [__('Failed to retrieve message ID after sending email.', 'bit-crm-sales-marketing-automation')]];
        }

        $email = Email::insert(
            [
                'message_id'      => $messageId,
                'entity_email'    => $validated['entity_email'],
                'email_date'      => current_time('mysql'),
                'subject'         => $validated['subject'],
                'body'            => $message,
                'email_direction' => CommonConstant::EMAIL_DIRECTION_SENT,
                'sent_from'       => Config::SLUG,
                'attachments'     => $validated['attachments'] ?? [],
                'created_by'      => get_current_user_id(),
            ]
        );

        return ['success' => true, 'data' => $email];
    }

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

    private function getMessageId($phpMailer): false|string
    {
        if ($phpMailer && !empty($phpMailer->getLastMessageID())) {
            return trim($phpMailer->getLastMessageID(), '<>');
        }

        return false;
    }
}
