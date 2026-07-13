<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Constants\Status;
use BitApps\Crm\Helpers\FileHandler;
use BitApps\Crm\Model\ImportExportList;

class ImportExportListService
{
    public static function createImportRecord(string $processId, string $module, string $fileName): int
    {
        $relativePath = FileHandler::getRelativeUploadPath(ImportExportList::IMPORT_DIR);

        $csvPath = $relativePath . $fileName;

        $import = ImportExportList::insert(
            [
                'type'       => ImportExportList::IMPORT,
                'module'     => $module,
                'process_id' => $processId,
                'file_name'  => $fileName,
                'file_path'  => $csvPath,
                'status'     => Status::PROCESSING,
                'created_by' => get_current_user_id(),
            ]
        );

        return $import->id;
    }

    public static function updateRecord(int $recordId, array $payload): void
    {
        ImportExportList::where('id', $recordId)->update($payload);
    }

    public static function updateRecordCounts(int $recordId, array $counts): void
    {
        $record = ImportExportList::where('id', $recordId)->first();
        if (!$record) {
            return;
        }

        foreach (
            [
                ImportExportList::COUNT['COMPLETED'],
                ImportExportList::COUNT['UPDATED'],
                ImportExportList::COUNT['SKIPPED'],
            ] as $key
        ) {
            if (isset($counts[$key])) {
                $record[$key] = ($record[$key] ?? 0) + (int) $counts[$key];
            }
        }

        $record->save();
    }
}
