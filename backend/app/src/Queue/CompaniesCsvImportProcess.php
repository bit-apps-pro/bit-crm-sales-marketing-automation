<?php

namespace BitApps\Crm\src\Queue;

use BitApps\Crm\Config;
use BitApps\Crm\Constants\CommonConstant;
use BitApps\Crm\Constants\Status;
use BitApps\Crm\Helpers\FileHandler;
use BitApps\Crm\Model\Company;
use BitApps\Crm\Services\CompanyImportService;
use BitApps\Crm\Services\ImportExportListService;

class CompaniesCsvImportProcess extends SafeBackgroundProcess
{
    protected const CHUNK_SIZE = 100;

    protected $action = Config::VAR_PREFIX . Company::IMPORT_PREFIX;

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

        $csvCompanies = FileHandler::readCsvChunk($filePath, $currentOffset, $this->fetchLimit);

        if (empty($csvCompanies)) {
            $this->batchComplete($importId, $processId, $filePath);

            return false;
        }

        $fields = Config::getOption(Company::CSV_FIELDS_PREFIX . $processId, []);
        $this->nameMappedKey = array_search(CommonConstant::KEY_ENTITY_NAME, $fields['systemDefinedFieldsValues']);

        $countDetails = [];
        $companyImportService = new CompanyImportService($importId);

        switch ($duplicateHandling) {
            case Company::DUPLICATE_SKIP:
                [$newCompanies] = $companyImportService->model(Company::class)->separateEntities($csvCompanies, $this->nameMappedKey, CommonConstant::KEY_ENTITY_NAME);
                $countDetails = $companyImportService->handleCompanyInsert($newCompanies, $fields, $this->fetchLimit);

                break;

            case Company::DUPLICATE_UPDATE:
                $countDetails = $companyImportService->handleCompanyCreateAndUpdate($csvCompanies, $fields, $this->nameMappedKey, $this->fetchLimit);

                break;

            case Company::DUPLICATE_CREATE:
                $countDetails = $companyImportService->handleCompanyInsert($csvCompanies, $fields, $this->fetchLimit);

                break;
        }

        ImportExportListService::updateRecordCounts($importId, $countDetails);

        $countProcessed = $currentOffset + \count($csvCompanies);
        if ($this->isNextChunkAvailable(\count($csvCompanies), self::CHUNK_SIZE, $totalLimit, $startingOffset, $currentOffset)) {
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

        Config::deleteOption(Company::CSV_FIELDS_PREFIX . $processId);
    }
}
