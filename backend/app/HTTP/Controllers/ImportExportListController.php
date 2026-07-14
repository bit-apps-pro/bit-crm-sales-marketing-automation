<?php

namespace BitApps\Crm\HTTP\Controllers;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Response;
use BitApps\Crm\Helpers\FileHandler;
use BitApps\Crm\HTTP\Requests\ImportExport\DestroyRequest;
use BitApps\Crm\HTTP\Requests\ImportExport\IndexRequest;
use BitApps\Crm\Model\ImportExportList;
use Throwable;

final class ImportExportListController
{
    private const DEFAULT_PER_PAGE = 10;

    public function index(IndexRequest $request)
    {
        $validated = $request->validated();
        $module = $validated['module'] ?? null;
        $page = $validated['page'] ?? 1;
        $perPage = $validated['perPage'] ?? self::DEFAULT_PER_PAGE;

        $importExportQuery = ImportExportList::where('type', $validated['type'])
            ->when(
                $module,
                function ($query) use ($module) {
                    $query->where('module', $module);
                }
            )
            ->orderBy('id')->desc();

        try {
            $result = $importExportQuery->paginate($page, $perPage);

            return Response::success($result);
        } catch (Throwable $th) {
            return Response::error(__('Something went wrong! Failed to fetch result!', 'bit-crm-sales-marketing-automation'));
        }
    }

    public function destroy(DestroyRequest $request)
    {
        $validated = $request->validated();

        $importExport = new ImportExportList($validated['id']);

        if (!$importExport->exists()) {
            return Response::error(__('Record not found!', 'bit-crm-sales-marketing-automation'));
        }

        $data = $importExport->getAttributes();

        $absoluteFilePath = null;
        if ($data['type'] === ImportExportList::EXPORT) {
            $filePath = $data['file_path'];
            $absoluteFilePath = ABSPATH . ltrim($filePath, '/');
        }

        try {
            $importExport->delete();
            if ($absoluteFilePath && FileHandler::isValidPath($absoluteFilePath)) {
                wp_delete_file($absoluteFilePath);
            }
        } catch (Throwable $th) {
            return Response::error(__('Failed to delete data!', 'bit-crm-sales-marketing-automation'));
        }

        return Response::success(__('Record deleted successfully', 'bit-crm-sales-marketing-automation'));
    }
}
