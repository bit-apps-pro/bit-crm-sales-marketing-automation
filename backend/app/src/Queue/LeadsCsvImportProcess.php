<?php

namespace BitApps\Crm\src\Queue;

use BitApps\Crm\Config;
use BitApps\Crm\Constants\CommonConstant;
use BitApps\Crm\Constants\Status;
use BitApps\Crm\Helpers\FileHandler;
use BitApps\Crm\Model\Lead;
use BitApps\Crm\Services\ImportExportListService;
use BitApps\Crm\Services\LeadImportService;

class LeadsCsvImportProcess extends SafeBackgroundProcess
{
    protected const CHUNK_SIZE = 100;

    protected $action = Config::VAR_PREFIX . Lead::IMPORT_PREFIX;

    protected $fetchLimit;

    protected $emailMappedKey;

    protected function task($item)
    {
        $params = $item['params'];
        $startingOffset = (int) ($params['offset'] ?? 0);
        $totalLimit = (int) ($params['limit'] ?? 0);
        $currentOffset = (int) $item['current_offset'];
        $processId = $item['process_id'];
        $importId = $item['import_id'];
        $filePath = $item['file_path'];
        $duplicateHandling = $item['duplicate_handling'];

        $remaining = $totalLimit > 0 ? ($startingOffset + $totalLimit) - $currentOffset : self::CHUNK_SIZE;
        $this->fetchLimit = min(self::CHUNK_SIZE, $remaining);

        $csvLeads = FileHandler::readCsvChunk($filePath, $currentOffset, $this->fetchLimit);

        if (empty($csvLeads)) {
            $this->batchComplete($importId, $processId, $filePath);

            return false;
        }

        $fields = Config::getOption(Lead::CSV_FIELDS_PREFIX . $processId, []);
        $this->emailMappedKey = array_search(CommonConstant::KEY_ENTITY_EMAIL, $fields['systemDefinedFieldsValues']);

        $countDetails = [];
        $leadImportService = new LeadImportService($importId);

        switch ($duplicateHandling) {
            case Lead::DUPLICATE_SKIP:
                [$newLeads] = $leadImportService->model(Lead::class)->separateEntities($csvLeads, $this->emailMappedKey, CommonConstant::KEY_ENTITY_EMAIL);
                $countDetails = $leadImportService->handleLeadInsert($newLeads, $fields, $this->fetchLimit);

                break;

            case Lead::DUPLICATE_UPDATE:
                $countDetails = $leadImportService->handleLeadCreateAndUpdate($csvLeads, $fields, $this->emailMappedKey, $this->fetchLimit);

                break;

            case Lead::DUPLICATE_CREATE:
                $countDetails = $leadImportService->handleLeadInsert($csvLeads, $fields, $this->fetchLimit);

                break;
        }

        ImportExportListService::updateRecordCounts($importId, $countDetails);

        $countProcessed = $currentOffset + \count($csvLeads);
        if ($this->isNextChunkAvailable(\count($csvLeads), self::CHUNK_SIZE, $totalLimit, $startingOffset, $currentOffset)) {
            return $this->queueNextChunk($importId, $processId, $params, $filePath, $countProcessed, $duplicateHandling);
        }

        $this->batchComplete($importId, $processId, $filePath);

        return false;
    }

    protected function isNextChunkAvailable(int $rowCount, int $chunkSize, int $totalLimit, int $startingOffset, int $currentOffset): bool
    {
        if ($rowCount < $chunkSize) {
            return false;
        }

        $nextOffset = $currentOffset + $chunkSize;

        return $totalLimit === 0 || $nextOffset < ($startingOffset + $totalLimit);
    }

    protected function queueNextChunk(int $importId, string $processId, array $params, string $filePath, int $currentOffset, string $duplicateHandling): array
    {
        return [
            'import_id'          => $importId,
            'process_id'         => $processId,
            'params'             => $params,
            'file_path'          => $filePath,
            'current_offset'     => $currentOffset,
            'duplicate_handling' => $duplicateHandling,
        ];
    }

    protected function batchComplete(int $importId, string $processId, string $filePath)
    {
        ImportExportListService::updateRecord(
            $importId,
            [
                'status' => Status::COMPLETED,
            ]
        );

        if (FileHandler::isValidPath($filePath)) {
            wp_delete_file($filePath);
        }

        Config::deleteOption(Lead::CSV_FIELDS_PREFIX . $processId);
    }
}
