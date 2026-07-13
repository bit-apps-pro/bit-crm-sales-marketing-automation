<?php

namespace BitApps\Crm\src\Imap;

use BitApps\Crm\Constants\CommonConstant;
use BitApps\Crm\Services\ImapService;

class Messages
{
    private $imapClientInstance;

    private $email;

    private $afterUid;

    private $imapSettingsId;

    public function __construct($email, $imapSettingsId, $afterUid = null)
    {
        $this->email = $email;
        $this->afterUid = $afterUid;
        $this->imapSettingsId = $imapSettingsId;
        $this->imapClientInstance = ImapFactory::getImapClientInstance($this->email, $this->imapSettingsId, $this->afterUid);
    }

    public function received(?int $limit = null, ?int $page = null)
    {
        if (!\is_object($this->imapClientInstance)) {
            return $this->imapClientInstance;
        }

        $receivedMessages = $this->imapClientInstance->receivedMessages($limit, $page);

        if (isset($receivedMessages['success']) && $receivedMessages['success'] === false) {
            return $receivedMessages;
        }

        return $this->formatMessages($receivedMessages);
    }

    public function sent(?int $limit = null, ?int $page = null)
    {
        if (!\is_object($this->imapClientInstance)) {
            return $this->imapClientInstance;
        }

        $sentMessages = $this->imapClientInstance->sentMessages($limit, $page);

        if (isset($sentMessages['success']) && $sentMessages['success'] === false) {
            return $sentMessages;
        }

        return $this->formatMessages($sentMessages);
    }

    public function receivedCount()
    {
        if (!\is_object($this->imapClientInstance)) {
            return $this->imapClientInstance;
        }

        return $this->imapClientInstance->receivedMessagesCount();
    }

    public function sentCount()
    {
        if (!\is_object($this->imapClientInstance)) {
            return $this->imapClientInstance;
        }

        return $this->imapClientInstance->sentMessagesCount();
    }

    public function getReceivedMessageByUid(int $uid)
    {
        if (!\is_object($this->imapClientInstance)) {
            return $this->imapClientInstance;
        }

        return $this->imapClientInstance->getReceivedMessageByUid($uid);
    }

    public function getSentMessageByUid($uid)
    {
        if (!\is_object($this->imapClientInstance)) {
            return $this->imapClientInstance;
        }

        return $this->imapClientInstance->getSentMessageByUid($uid);
    }

    private function formatMessages(array $messages)
    {
        $storedMessageIds = ImapService::getStoredMessageIds($this->email, $this->imapSettingsId);
        $formattedMessages = [];

        foreach ($messages as $message) {
            $messageId = $message->getMessageId()->first();

            if (\is_array($storedMessageIds) && \in_array($messageId, $storedMessageIds)) {
                continue;
            }

            $data = [
                'email_uid'       => $message->uid,
                'entity_email'    => $this->email,
                'email_date'      => $message->get('date')->first()->format('Y-m-d H:i:s'),
                'subject'         => $message->get('subject')->first(),
                'email_direction' => $message->get('from')->first()->mail === $this->email
                ? CommonConstant::EMAIL_DIRECTION_RECEIVED : CommonConstant::EMAIL_DIRECTION_SENT,
                'imap_id'    => $this->imapSettingsId,
                'message_id' => $messageId,
            ];

            $formattedMessages[] = $data;
        }

        return $formattedMessages;
    }
}
