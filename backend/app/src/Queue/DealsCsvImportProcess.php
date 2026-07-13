<?php

namespace BitApps\Crm\src\Queue;

use BitApps\Crm\Config;
use BitApps\Crm\Constants\CommonConstant;
use BitApps\Crm\Constants\Status;
use BitApps\Crm\Helpers\FileHandler;
use BitApps\Crm\Model\Deal;
use BitApps\Crm\Services\DealImportService;
use BitApps\Crm\Services\ImportExportListService;
use WP_Background_Process;

class DealsCsvImportProcess extends WP_Background_Process
{
    protected const CHUNK_SIZE = 100;

    protected $action = Config::VAR_PREFIX . Deal::IMPORT_PREFIX;

    protected $fetchLimit;

    protected $nameMappedKey;

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

        $csvDeals = FileHandler::readCsvChunk($filePath, $currentOffset, $this->fetchLimit);

        if (empty($csvDeals)) {
            $this->batchComplete($importId, $processId, $filePath);

            return false;
        }

        $fields = Config::getOption(Deal::CSV_FIELDS_PREFIX . $processId, []);
        $this->nameMappedKey = array_search('name', $fields['systemDefinedFieldsValues']);

        $countDetails = [];
        $leadImportService = new DealImportService($importId);

        switch ($duplicateHandling) {
            case Deal::DUPLICATE_SKIP:
                [$newDeals] = $leadImportService->model(Deal::class)->separateEntities($csvDeals, $this->nameMappedKey, CommonConstant::KEY_ENTITY_NAME);
                $countDetails = $leadImportService->handleDealInsert($newDeals, $fields, $this->fetchLimit);

                break;

            case Deal::DUPLICATE_UPDATE:
                $countDetails = $leadImportService->handleDealCreateAndUpdate($csvDeals, $fields, $this->nameMappedKey, $this->fetchLimit);

                break;

            case Deal::DUPLICATE_CREATE:
                $countDetails = $leadImportService->handleDealInsert($csvDeals, $fields, $this->fetchLimit);

                break;
        }

        ImportExportListService::updateRecordCounts($importId, $countDetails);

        $countProcessed = $currentOffset + \count($csvDeals);
        if ($this->isNextChunkAvailable(\count($csvDeals), self::CHUNK_SIZE, $totalLimit, $startingOffset, $currentOffset)) {
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

        Config::deleteOption(Deal::CSV_FIELDS_PREFIX . $processId);
    }
}
