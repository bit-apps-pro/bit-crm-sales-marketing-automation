<?php

namespace BitApps\Crm\src\Queue;

use BitApps\Crm\Config;
use BitApps\Crm\Constants\CommonConstant;
use BitApps\Crm\Model\Email;
use BitApps\Crm\Model\ImapSetting;
use BitApps\Crm\src\Imap\Messages;
use Throwable;

class FetchImapEmailsProcess extends SafeBackgroundProcess
{
    private const EMAILS_PER_BATCH = 50;

    protected $action = Config::VAR_PREFIX . 'fetch_imap_emails';

    protected function task($item)
    {
        $imapMessages = new Messages($item['email'], $item['imap_id'], $item['afterUid']);

        $total = $this->getTotal($imapMessages, $item);

        if (\is_bool($total)) {
            $this->batchFailed($item['emailWithImapId'], $item['emailDirection']);

            return false;
        }

        $paginationData = $this->generatePagination($total, $item['emailWithImapId'], $item['emailDirection']);

        if ($paginationData['currentPage'] === 0) {
            $this->batchComplete($item['emailWithImapId'], $item['emailDirection']);

            return false;
        }

        if ($item['emailDirection'] === CommonConstant::EMAIL_DIRECTION_RECEIVED) {
            $imapMessages = $imapMessages->received(
                $paginationData['perPage'],
                $paginationData['currentPage']
            );
        }

        if ($item['emailDirection'] === CommonConstant::EMAIL_DIRECTION_SENT) {
            $imapMessages = $imapMessages->sent(
                $paginationData['perPage'],
                $paginationData['currentPage']
            );
        }

        if (isset($imapMessages['success']) && !$imapMessages['success']) {
            $this->batchFailed($item['emailWithImapId'], $item['emailDirection']);

            return false;
        }

        if (\is_array($imapMessages) && !empty($imapMessages)) {
            try {
                Email::insert($imapMessages);
            } catch (Throwable $th) {
            }
        }

        $item['total'] = $total;

        return $item;
    }

    private function batchComplete($key, $emailDirection)
    {
        $statusOptionName = ImapSetting::FETCH_STATUS_OPTION_NAME . '_' . $key . '_' . $emailDirection;
        $paginationOptionName = ImapSetting::FETCH_PAGINATION_DATA_OPTION_NAME . '_' . $key . '_' . $emailDirection;

        Config::deleteOption($paginationOptionName);

        Config::updateOption($statusOptionName, ImapSetting::STATUS_FETCH_COMPLETED);
    }

    private function batchFailed($key, $emailDirection)
    {
        $statusOptionName = ImapSetting::FETCH_STATUS_OPTION_NAME . '_' . $key . '_' . $emailDirection;
        $paginationOptionName = ImapSetting::FETCH_PAGINATION_DATA_OPTION_NAME . '_' . $key . '_' . $emailDirection;

        Config::deleteOption($paginationOptionName);

        Config::updateOption($statusOptionName, ImapSetting::STATUS_FETCH_ERROR);
    }

    private function generatePagination($total, $key, $emailDirection)
    {
        $optionName = ImapSetting::FETCH_PAGINATION_DATA_OPTION_NAME . '_' . $key . '_' . $emailDirection;

        $paginationData = Config::getOption($optionName, []);
        $perPage = self::EMAILS_PER_BATCH;

        if (empty($paginationData)) {
            $totalPage = (int) ceil($total / $perPage);
            $currentPage = 1;
        } else {
            $totalPage = isset($paginationData['totalPage']) ? (int) $paginationData['totalPage'] : 0;
            $currentPage = isset($paginationData['currentPage']) ? ((int) $paginationData['currentPage'] + 1) : 1;
        }

        if ($currentPage > $totalPage) {
            $currentPage = 0;
        }

        $data = [
            'total'       => (int) $total,
            'totalPage'   => $totalPage,
            'currentPage' => $currentPage,
            'perPage'     => $perPage,
        ];

        Config::updateOption($optionName, $data);

        return $data;
    }

    private function getTotal($imapMessages, $item): bool|int
    {
        if (isset($item['total']) && \is_int($item['total'])) {
            return $item['total'];
        }

        if ($item['emailDirection'] === CommonConstant::EMAIL_DIRECTION_RECEIVED) {
            $total = $imapMessages->receivedCount();
        }

        if ($item['emailDirection'] === CommonConstant::EMAIL_DIRECTION_SENT) {
            $total = $imapMessages->sentCount();
        }

        if (\is_array($total) && isset($total['success']) && !$total['success']) {
            return false;
        }

        return \is_int($total) ? $total : 0;
    }
}
