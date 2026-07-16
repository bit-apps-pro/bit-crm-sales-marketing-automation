<?php

namespace BitApps\Crm\src\Queue;

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPDatabase\Connection;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Model\Lead;
use BitApps\Crm\Services\LeadConvertService;
use Throwable;
use WP_Background_Process;

class LeadsConvertToContactsProcess extends WP_Background_Process
{
    public const CHUNK_SIZE = 10;

    protected $action = Config::VAR_PREFIX . 'convert_leads_to_contacts';

    protected function task($item)
    {
        $ids = $item['ids'];
        $defaultOwnerId = $item['defaultOwnerId'] ?? null;
        $options = $item['options'];
        $mapping = $item['mapping'];

        $chunkedIds = \array_slice($ids, 0, self::CHUNK_SIZE);
        $remainingIds = \array_slice($ids, self::CHUNK_SIZE);

        if (empty($chunkedIds)) {
            return false;
        }

        Connection::startTransaction();

        try {
            $leadConvertService = new LeadConvertService($chunkedIds, $defaultOwnerId, $options, $mapping);

            $leadConvertService->convertToCompanies();

            $convertedContacts = $leadConvertService->convertToContacts();

            $leadConvertService->convertToDeals($convertedContacts);

            Lead::whereIn('id', $chunkedIds)->update(['is_converted' => 1]);

            Connection::commit();

            Hooks::doAction('bit_crm/leads_converted_to_contact', $chunkedIds);
        } catch (Throwable $th) {
            Connection::rollback();
        }

        if (!empty($remainingIds)) {
            return self::queueNextChunk($remainingIds, $defaultOwnerId, $options, $mapping);
        }

        return false;
    }

    protected function queueNextChunk(array $ids, ?int $defaultOwnerId, array $options, array $mapping): array
    {
        return [
            'ids'            => $ids,
            'defaultOwnerId' => $defaultOwnerId,
            'options'        => $options,
            'mapping'        => $mapping
        ];
    }
}
