<?php

namespace BitApps\Crm\src\Imap;

use Throwable;

class BaseImap
{
    protected $emailAddress;

    protected $uidAfter;

    protected $clientConfig;

    protected $sentFolder;

    protected $receivedFolder;

    protected $sentType = 'To';

    protected $receivedType = 'From';

    private $client;

    public function __construct()
    {
        $clientManager = new ClientManagerConfig();
        $this->client = $this->connection($clientManager);
    }

    public function __destruct()
    {
        if ($this->client && !\is_string($this->client) && $this->client->isConnected()) {
            $this->client->disconnect();
        }
    }

    public function receivedMessages(?int $limit, ?int $page)
    {
        if (empty($this->receivedFolder) || empty($this->receivedType)) {
            return ['success' => false, 'message' => __('Received folder or type is not set.', 'bit-crm')];
        }

        return $this->messages($this->receivedFolder, $this->receivedType, $limit, $page);
    }

    public function sentMessages(?int $limit, ?int $page)
    {
        if (empty($this->sentFolder) || empty($this->sentType)) {
            return ['success' => false, 'message' => __('Sent folder or type is not set.', 'bit-crm')];
        }

        return $this->messages($this->sentFolder, $this->sentType, $limit, $page);
    }

    public function receivedMessagesCount()
    {
        if (empty($this->receivedFolder) || empty($this->receivedType)) {
            return ['success' => false, 'message' => __('Received folder or type is not set.', 'bit-crm')];
        }

        return $this->countMessages($this->receivedFolder, $this->receivedType);
    }

    public function sentMessagesCount()
    {
        if (empty($this->sentFolder) || empty($this->sentType)) {
            return ['success' => false, 'message' => __('Sent folder or type is not set.', 'bit-crm')];
        }

        return $this->countMessages($this->sentFolder, $this->sentType);
    }

    public function getReceivedMessageByUid(string $uid)
    {
        if (empty($this->receivedFolder)) {
            return ['success' => false, 'message' => __('Received folder is not set.', 'bit-crm')];
        }

        return $this->messageByUid($this->receivedFolder, $uid);
    }

    public function getSentMessageByUid(string $uid)
    {
        if (empty($this->sentFolder)) {
            return ['success' => false, 'message' => __('Sent folder is not set.', 'bit-crm')];
        }

        return $this->messageByUid($this->sentFolder, $uid);
    }

    protected function connection($clientManager)
    {
        $clientConfig = $this->clientConfig;
        $clientConfig['protocol'] = 'imap';

        if (isset($clientConfig['app_password'])) {
            $clientConfig['password'] = $clientConfig['app_password'];
        }

        $client = $clientManager->make($clientConfig);

        try {
            $client->connect();
        } catch (Throwable $th) {
            return $th->getMessage();
        }

        return $client;
    }

    /**
     * Get messages from the mailbox.
     *
     * @return array
     */
    protected function messages(string $folder, string $type, ?int $limit, ?int $page)
    {
        if (\is_string($this->client)) {
            return ['success' => false, 'message' => $this->client];
        }

        try {
            $folder = $this->client->getFolder($folder)->query()->where($type, $this->emailAddress);

            if ($this->uidAfter) {
                $folder->where("CUSTOM UID {$this->uidAfter}:*");
            }

            $folder->setFetchBody(false)->all();

            if (!empty($limit) && !empty($page)) {
                $folder->limit($limit, $page);
            } elseif (!empty($limit)) {
                $folder->limit($limit);
            }

            return $folder->get()->toArray();
        } catch (Throwable $th) {
            return [];
        }
    }

    protected function countMessages(string $folder, string $type): array|int
    {
        if (\is_string($this->client)) {
            return ['success' => false, 'message' => $this->client];
        }

        try {
            $folder = $this->client->getFolder($folder)->query()->where($type, $this->emailAddress);

            if ($this->uidAfter) {
                $folder->where("CUSTOM UID {$this->uidAfter}:*");
            }

            return $folder->all()->count();
        } catch (Throwable $th) {
            return 0;
        }
    }

    protected function messageByUid(string $folder, string $uid)
    {
        if (\is_string($this->client)) {
            return ['success' => false, 'message' => $this->client];
        }

        try {
            return $this->client->getFolder($folder)->query()->getMessageByUid($uid);
        } catch (Throwable $th) {
            return [];
        }
    }
}
