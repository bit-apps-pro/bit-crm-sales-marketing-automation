<?php

namespace BitApps\Crm\HTTP\Controllers;

use BitApps\Crm\Config;
use BitApps\Crm\Constants\Status;
use BitApps\Crm\Deps\BitApps\WPKit\Helpers\JSON;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Deps\BitApps\WPKit\Http\Response;
use BitApps\Crm\Helpers\FileHandler;
use BitApps\Crm\Helpers\Uuid;
use BitApps\Crm\HTTP\Requests\Company\AttachTagRequest;
use BitApps\Crm\HTTP\Requests\Company\AttachTagsRequest;
use BitApps\Crm\HTTP\Requests\Company\DetachTagRequest;
use BitApps\Crm\HTTP\Requests\Company\DetachTagsRequest;
use BitApps\Crm\HTTP\Requests\Company\ImportRequest;
use BitApps\Crm\HTTP\Requests\Company\SearchRequest;
use BitApps\Crm\HTTP\Requests\Company\ShowRequest;
use BitApps\Crm\HTTP\Requests\Company\StoreRequest;
use BitApps\Crm\HTTP\Requests\Company\TrashRequest;
use BitApps\Crm\HTTP\Requests\Company\UpdateRequest;
use BitApps\Crm\Model\Company;
use BitApps\Crm\Model\ImportExportList;
use BitApps\Crm\Model\Tag;
use BitApps\Crm\Model\TagEntity;
use BitApps\Crm\Services\CompanyService;
use BitApps\Crm\Services\ImportExportListService;
use BitApps\Crm\Services\SettingService;
use BitApps\Crm\Services\TagService;
use BitApps\Crm\src\Capability;
use BitApps\Crm\src\Queue\CompaniesCsvImportProcess;
use BitApps\Crm\Traits\FormatPagination;
use BitApps\Crm\Utils\Logger;
use Throwable;

final class CompanyController
{
    use FormatPagination;

    public const DEFAULT_PER_PAGE = 10;

    private CompanyService $companyService;

    public function __construct()
    {
        $this->companyService = new CompanyService();
    }

    public function fieldsWithOrder()
    {
        $fieldsOrder = SettingService::getSettingsValue(Company::SETTINGS_KEYS['FIELDS_ORDER']);
        $columnSettings = SettingService::getSettingsValue(Company::SETTINGS_KEYS['COLUMNS_SETTINGS']);

        return Response::success(
            [
                'fields'          => $this->companyService->fields(),
                'orders'          => $fieldsOrder,
                'column_settings' => $columnSettings
            ]
        );
    }

    public function tableConfiguration()
    {
        $columnsOrder = SettingService::getSettingsValue(Company::SETTINGS_KEYS['COLUMNS_ORDER']);
        $visibleColumns = SettingService::getSettingsValue(Company::SETTINGS_KEYS['TABLE_VISIBLE_COLUMNS']);

        return Response::success(
            [
                'fields'          => $this->companyService->fields(),
                'orders'          => $columnsOrder,
                'visible_columns' => $visibleColumns
            ]
        );
    }

    public function store(StoreRequest $request)
    {
        $result = $this->companyService->store($request);

        if (!$result['success']) {
            return Response::error($result['errors'][0]);
        }

        return Response::success($result['data']);
    }

    public function show(ShowRequest $request)
    {
        $result = $this->companyService->show($request);

        if (!$result['success']) {
            return Response::error($result['errors'][0]);
        }

        return Response::success($result['data']);
    }

    public function update(UpdateRequest $request)
    {
        $result = $this->companyService->update($request);

        if (!$result['success']) {
            return Response::error($result['errors'][0]);
        }

        return Response::success($result['data'])->message($result['message']);
    }

    public function search(SearchRequest $request)
    {
        $validatedData = $request->validated();
        $page = !empty($validatedData['page']) ? $validatedData['page'] : 1;
        $perPage = !empty($validatedData['perPage']) ? $validatedData['perPage'] : self::DEFAULT_PER_PAGE;
        $offset = ($page - 1) * $perPage;

        try {
            $data = $this->companyService->search(
                [
                    'perPage'              => $perPage,
                    'offset'               => $offset,
                    'page'                 => $page,
                    'sortBy'               => !empty($validatedData['sortBy']) ? $validatedData['sortBy'] : 'id',
                    'sortOrder'            => !empty($validatedData['sortOrder']) ? $validatedData['sortOrder'] : 'asc',
                    'searchTerm'           => $validatedData['searchTerm'],
                    'filters'              => !empty($validatedData['filters']) ? $validatedData['filters'] : [],
                    'tags'                 => !empty($validatedData['tags']) ? $validatedData['tags'] : [],
                    'advancedFilterGroups' => $validatedData['advancedFilterGroups'] ?? [],
                ]
            );

            return Response::success($data);
        } catch (Throwable $th) {
            Logger::error($th);

            return Response::error(null)->message(__('Failed to search companies!', 'bit-crm-sales-marketing-automation'));
        }
    }

    public function trash(TrashRequest $request)
    {
        $result = $this->companyService->trash($request);

        if (!$result['success']) {
            return Response::error($result['errors'][0]);
        }

        return Response::success($result['data'])->message($result['message']);
    }

    public function attachTag(AttachTagRequest $request)
    {
        $validated = $request->validated();
        $companyId = $validated['company_id'];
        $tag = Tag::findOne(['module' => Company::MODULE_NAME, 'slug' => $validated['title']]);

        unset($validated['company_id']);

        if (empty($tag) && Capability::check('bit_crm_tag_create')) {
            $result = (new TagService())->store(
                [
                    'title'  => $validated['title'],
                    'module' => Company::MODULE_NAME
                ]
            );

            $tag = !empty($result['success']) ? $result['data'] : null;
        }

        if (empty($tag)) {
            return Response::error(__('Failed to add tag', 'bit-crm-sales-marketing-automation'));
        }

        $tagEntity = [
            'module'    => Company::MODULE_NAME,
            'tag_id'    => $tag->id,
            'entity_id' => $companyId,
        ];

        if (TagEntity::findOne($tagEntity)) {
            return Response::success(__('Tag already added', 'bit-crm-sales-marketing-automation'));
        }

        if (TagEntity::insert($tagEntity)) {
            Hooks::doAction('bit_crm/tag_attached_to_company', $tag, $companyId);

            return Response::success(__('Tag added successfully.', 'bit-crm-sales-marketing-automation'));
        }

        return Response::error(__('Failed to add tag.', 'bit-crm-sales-marketing-automation'));
    }

    public function detachTag(DetachTagRequest $request)
    {
        $validated = $request->validated();

        $tagId = $validated['tag_id'];
        $companyId = $validated['company_id'];
        $tagEntity = TagEntity::where('tag_id', $tagId)
            ->where('entity_id', $companyId)
            ->where('module', Company::MODULE_NAME);

        if (!$tagEntity->delete()) {
            return Response::error(__('Failed to remove tag', 'bit-crm-sales-marketing-automation'));
        }

        Hooks::doAction('bit_crm/tag_detached_from_company', $tagId, $companyId);

        return Response::success(__('Tag removed successfully.', 'bit-crm-sales-marketing-automation'));
    }

    public function attachTags(AttachTagsRequest $request)
    {
        $validated = $request->validated();

        $companyIds = $validated['company_ids'];
        $tagIds = $validated['tag_ids'];

        if (\count($companyIds) && \count($tagIds)) {
            $existingRecords = TagEntity::select(['entity_id', 'tag_id'])
                ->whereIn('entity_id', $companyIds)
                ->whereIn('tag_id', $tagIds)
                ->where('module', Company::MODULE_NAME)
                ->get();

            $existingData = [];

            foreach ($existingRecords as $item) {
                $existingData[$item->entity_id][] = $item->tag_id;
            }

            $dataToInsert = [];

            foreach ($companyIds as $entityId) {
                foreach ($tagIds as $tagId) {
                    if (isset($existingData[$entityId]) && \in_array($tagId, $existingData[$entityId])) {
                        continue;
                    }

                    $dataToInsert[] = [
                        'entity_id' => $entityId,
                        'tag_id'    => $tagId,
                        'module'    => Company::MODULE_NAME,
                    ];
                }
            }
        }

        if (empty($dataToInsert)) {
            return Response::error(__('Tags already added', 'bit-crm-sales-marketing-automation'));
        }

        TagEntity::insert($dataToInsert);

        Hooks::doAction('bit_crm/tags_attached_to_companies', $tagIds, $companyIds);

        return Response::success(__('Tag added successfully.', 'bit-crm-sales-marketing-automation'));
    }

    public function detachTags(DetachTagsRequest $request)
    {
        $validated = $request->validated();
        $companyIds = $validated['company_ids'];
        $tagIds = $validated['tag_ids'];

        if ($this->companyService->detachTags($companyIds, $tagIds)) {
            return Response::success(__('Tag(s) removed successfully.', 'bit-crm-sales-marketing-automation'));
        }

        return Response::error(__('Failed to remove tag(s)!', 'bit-crm-sales-marketing-automation'));
    }

    public function import(ImportRequest $request)
    {
        $validated = $request->validated();
        $files = $request->files();
        $file = $files['file'];

        if (!FileHandler::isFileType($file, 'csv')) {
            return Response::success(__('Only csv files are allowed.', 'bit-crm-sales-marketing-automation'));
        }

        $fields = JSON::maybeDecode($validated['fields'], true);
        $options = JSON::maybeDecode($validated['options'], true);

        $duplicateHandling = $options['duplicate_handling'] ?? Company::DUPLICATE_SKIP;

        [$filePath, $fileName] = FileHandler::uploadFile($file, ImportExportList::IMPORT_DIR);

        $processId = Company::IMPORT_PREFIX . Uuid::generate();
        $totalRows = FileHandler::getCsvRecordCount($filePath);

        $importId = ImportExportListService::createImportRecord($processId, Company::MODULE_NAME, $fileName);
        ImportExportListService::updateRecord(
            $importId,
            [
                'status'                         => Status::PROCESSING,
                ImportExportList::COUNT['TOTAL'] => $totalRows
            ]
        );

        Config::addOption(Company::CSV_FIELDS_PREFIX . $processId, $fields, true);

        (new CompaniesCsvImportProcess())->push_to_queue(
            [
                'import_id'          => $importId,
                'process_id'         => $processId,
                'file_path'          => $filePath,
                'duplicate_handling' => $duplicateHandling,
                'current_offset'     => 0,
                'params'             => [
                    'offset' => 0,
                    'limit'  => $totalRows,
                ],
            ]
        )->save()->dispatch();

        return Response::success(__('Import started successfully in the background.', 'bit-crm-sales-marketing-automation'));
    }
}
