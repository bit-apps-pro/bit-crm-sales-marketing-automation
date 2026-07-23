<?php

namespace BitApps\Crm\HTTP\Controllers;

use BitApps\Crm\Config;
use BitApps\Crm\Constants\Status;
use BitApps\Crm\Deps\BitApps\WPDatabase\Connection;
use BitApps\Crm\Deps\BitApps\WPKit\Helpers\JSON;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Deps\BitApps\WPKit\Http\Response;
use BitApps\Crm\Helpers\FileHandler;
use BitApps\Crm\Helpers\Uuid;
use BitApps\Crm\HTTP\Requests\Lead\AttachTagRequest;
use BitApps\Crm\HTTP\Requests\Lead\AttachTagsRequest;
use BitApps\Crm\HTTP\Requests\Lead\ConvertRequest;
use BitApps\Crm\HTTP\Requests\Lead\ConvertSingleRequest;
use BitApps\Crm\HTTP\Requests\Lead\DetachTagRequest;
use BitApps\Crm\HTTP\Requests\Lead\DetachTagsRequest;
use BitApps\Crm\HTTP\Requests\Lead\ImportRequest;
use BitApps\Crm\HTTP\Requests\Lead\SearchRequest;
use BitApps\Crm\HTTP\Requests\Lead\ShowRequest;
use BitApps\Crm\HTTP\Requests\Lead\StoreRequest;
use BitApps\Crm\HTTP\Requests\Lead\TrashRequest;
use BitApps\Crm\HTTP\Requests\Lead\UpdateRequest;
use BitApps\Crm\Model\ImportExportList;
use BitApps\Crm\Model\Lead;
use BitApps\Crm\Model\Tag;
use BitApps\Crm\Model\TagEntity;
use BitApps\Crm\Services\ConvertService;
use BitApps\Crm\Services\ImportExportListService;
use BitApps\Crm\Services\LeadConvertService;
use BitApps\Crm\Services\LeadService;
use BitApps\Crm\Services\SettingService;
use BitApps\Crm\Services\TagService;
use BitApps\Crm\src\Capability;
use BitApps\Crm\src\Queue\LeadsConvertToContactsProcess;
use BitApps\Crm\src\Queue\LeadsCsvImportProcess;
use BitApps\Crm\Utils\Logger;
use Exception;
use Throwable;

final class LeadController
{
    public const DEFAULT_PER_PAGE = 10;

    private LeadService $leadService;

    public function __construct()
    {
        $this->leadService = new LeadService();
    }

    public function store(StoreRequest $request)
    {
        $result = $this->leadService->store($request);

        if (!$result['success']) {
            return Response::error(__('Failed to create new lead!', 'bit-crm-sales-marketing-automation'));
        }

        return Response::success($result['data']);
    }

    public function show(ShowRequest $request)
    {
        $result = $this->leadService->show($request);

        if (!$result['success']) {
            return Response::error(__('Failed to fetch lead!', 'bit-crm-sales-marketing-automation'));
        }

        return Response::success($result['data']);
    }

    public function update(UpdateRequest $request)
    {
        $result = $this->leadService->update($request);

        if (!$result['success']) {
            return Response::error(__('Failed to update lead!', 'bit-crm-sales-marketing-automation'));
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
            $data = $this->leadService->search(
                [
                    'page'                 => $page,
                    'perPage'              => $perPage,
                    'offset'               => $offset,
                    'sortBy'               => !empty($validatedData['sortBy']) ? $validatedData['sortBy'] : 'id',
                    'sortOrder'            => !empty($validatedData['sortOrder']) ? $validatedData['sortOrder'] : 'desc',
                    'searchTerm'           => $validatedData['searchTerm'],
                    'filters'              => !empty($validatedData['filters']) ? $validatedData['filters'] : [],
                    'tags'                 => !empty($validatedData['tags']) ? $validatedData['tags'] : [],
                    'ids'                  => !empty($validatedData['ids']) ? $validatedData['ids'] : [],
                    'advancedFilterGroups' => $validatedData['advancedFilterGroups'] ?? [],
                ]
            );

            return Response::success($data);
        } catch (Throwable $th) {
            Logger::error($th);

            return Response::error(null)->message(__('Failed to search leads!', 'bit-crm-sales-marketing-automation'));
        }
    }

    public function trash(TrashRequest $request)
    {
        $result = $this->leadService->trash($request);

        if (!$result['success']) {
            return Response::error($result['errors'][0]);
        }

        return Response::success($result['data'])->message($result['message']);
    }

    public function fieldsWithOrder()
    {
        $fieldsOrder = SettingService::getSettingsValue(Lead::SETTINGS_KEYS['FIELDS_ORDER']);
        $columnSettings = SettingService::getSettingsValue(Lead::SETTINGS_KEYS['COLUMNS_SETTINGS']);

        return Response::success(['fields' => $this->leadService->fields(), 'orders' => $fieldsOrder, 'column_settings' => $columnSettings]);
    }

    public function tableConfiguration()
    {
        $columnsOrder = SettingService::getSettingsValue(Lead::SETTINGS_KEYS['COLUMNS_ORDER']);
        $visibleColumns = SettingService::getSettingsValue(Lead::SETTINGS_KEYS['TABLE_VISIBLE_COLUMNS']);

        return Response::success(['fields' => $this->leadService->fields(), 'orders' => $columnsOrder, 'visible_columns' => $visibleColumns]);
    }

    public function conversionMapping()
    {
        $conversionMapping = SettingService::getSettingsValue(Lead::SETTINGS_KEYS['CONVERSION_MAPPING']);

        return Response::success($conversionMapping);
    }

    public function attachTag(AttachTagRequest $request)
    {
        $validated = $request->validated();

        $leadId = $validated['lead_id'];
        $tag = Tag::findOne(['module' => Lead::MODULE_NAME, 'slug' => $validated['title']]);

        unset($validated['lead_id']);

        if (empty($tag) && Capability::check('bit_crm_tag_create')) {
            $result = (new TagService())->store(
                [
                    'title'  => $validated['title'],
                    'module' => Lead::MODULE_NAME
                ]
            );

            $tag = !empty($result['success']) ? $result['data'] : null;
        }

        if (empty($tag)) {
            return Response::error(__('Failed to add tag', 'bit-crm-sales-marketing-automation'));
        }

        $tagEntity = [
            'module'    => Lead::MODULE_NAME,
            'tag_id'    => $tag->id,
            'entity_id' => $leadId,
        ];

        if (TagEntity::findOne($tagEntity)) {
            return Response::success(__('Tag already added', 'bit-crm-sales-marketing-automation'));
        }

        if (TagEntity::insert($tagEntity)) {
            Hooks::doAction('bit_crm/tag_attached_to_lead', $tag, $leadId);

            return Response::success(__('Tag added successfully.', 'bit-crm-sales-marketing-automation'));
        }

        return Response::error(__('Failed to add tag.', 'bit-crm-sales-marketing-automation'));
    }

    public function detachTag(DetachTagRequest $request)
    {
        $validated = $request->validated();

        $tagId = $validated['tag_id'];
        $leadId = $validated['lead_id'];
        $tagEntity = TagEntity::where('tag_id', $tagId)
            ->where('entity_id', $leadId)
            ->where('module', Lead::MODULE_NAME);

        if (!$tagEntity->delete()) {
            return Response::error(__('Failed to remove tag', 'bit-crm-sales-marketing-automation'));
        }

        Hooks::doAction('bit_crm/tag_detached_from_lead', $tagId, $leadId);

        return Response::success(__('Tag removed successfully.', 'bit-crm-sales-marketing-automation'));
    }

    public function attachTags(AttachTagsRequest $request)
    {
        $validated = $request->validated();

        $leadIds = $validated['lead_ids'];
        $tagIds = $validated['tag_ids'];

        if (\count($leadIds) && \count($tagIds)) {
            $existingRecords = TagEntity::select(['entity_id', 'tag_id'])
                ->whereIn('entity_id', $leadIds)
                ->whereIn('tag_id', $tagIds)
                ->where('module', Lead::MODULE_NAME)
                ->get();

            $existingData = [];

            foreach ($existingRecords as $item) {
                $existingData[$item->entity_id][] = $item->tag_id;
            }

            $dataToInsert = [];

            foreach ($leadIds as $entityId) {
                foreach ($tagIds as $tagId) {
                    if (isset($existingData[$entityId]) && \in_array($tagId, $existingData[$entityId])) {
                        continue;
                    }

                    $dataToInsert[] = [
                        'entity_id' => $entityId,
                        'tag_id'    => $tagId,
                        'module'    => Lead::MODULE_NAME,
                    ];
                }
            }
        }

        if (empty($dataToInsert)) {
            return Response::error(__('Tags already added', 'bit-crm-sales-marketing-automation'));
        }

        TagEntity::insert($dataToInsert);

        Hooks::doAction('bit_crm/tags_attached_to_leads', $tagIds, $leadIds);

        return Response::success(__('Tag added successfully.', 'bit-crm-sales-marketing-automation'));
    }

    public function detachTags(DetachTagsRequest $request)
    {
        $validated = $request->validated();
        $leadIds = $validated['lead_ids'];
        $tagIds = $validated['tag_ids'];

        if ($this->leadService->detachTags($leadIds, $tagIds)) {
            return Response::success(__('Tag(s) removed successfully.', 'bit-crm-sales-marketing-automation'));
        }

        return Response::error(__('Failed to remove tag(s)!', 'bit-crm-sales-marketing-automation'));
    }

    public function convert(ConvertRequest $request)
    {
        $validated = $request->validated();
        $ids = $validated['ids'];
        $defaultOwnerId = $validated['defaultOwnerId'] ?? null;

        unset($validated['ids'], $validated['defaultOwnerId']);

        try {
            $mapping = ConvertService::getConversionMapping();

            (new LeadsConvertToContactsProcess())
                ->push_to_queue(
                    [
                        'ids'            => $ids,
                        'defaultOwnerId' => $defaultOwnerId,
                        'options'        => $validated,
                        'mapping'        => $mapping,
                    ]
                )
                ->save()
                ->dispatch();

            return Response::success(__('Leads conversion started in background.', 'bit-crm-sales-marketing-automation'));
        } catch (Throwable $th) {
            return Response::error(__('Failed to convert leads.', 'bit-crm-sales-marketing-automation'));
        }
    }

    public function convertSingle(ConvertSingleRequest $request)
    {
        $validated = $request->validated();
        $id = $validated['id'];
        $defaultOwnerId = $validated['defaultOwnerId'] ?? null;

        unset($validated['id'], $validated['defaultOwnerId']);

        Connection::startTransaction();

        try {
            $mapping = ConvertService::getConversionMapping();

            $leadConvertService = new LeadConvertService([$id], $defaultOwnerId, $validated, $mapping);

            $leadConvertService->convertToCompanies();

            $convertedContacts = $leadConvertService->convertToContacts();
            if (empty($convertedContacts) || !isset($convertedContacts[0]['id'])) {
                throw new Exception(__('Failed to convert lead.', 'bit-crm-sales-marketing-automation'));
            }

            $leadConvertService->convertToDeals($convertedContacts);

            Lead::where('id', $id)->update(['is_converted' => 1]);

            Connection::commit();
        } catch (Throwable $th) {
            Connection::rollback();

            return Response::error(__('Failed to convert lead.', 'bit-crm-sales-marketing-automation'));
        }

        $leadConvertService->dispatchCreationHooks();
        Hooks::doAction('bit_crm/leads_converted_to_contact', [(int) $id]);

        return Response::success(['convertedContactId' => $convertedContacts[0]['id']])
            ->message(__('Lead converted successfully.', 'bit-crm-sales-marketing-automation'));
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

        $duplicateHandling = $options['duplicate_handling'] ?? Lead::DUPLICATE_SKIP;

        [$filePath, $fileName] = FileHandler::uploadFile($file, ImportExportList::IMPORT_DIR);

        $processId = Lead::IMPORT_PREFIX . Uuid::generate();
        $totalRows = FileHandler::getCsvRecordCount($filePath);

        $importId = ImportExportListService::createImportRecord($processId, Lead::MODULE_NAME, $fileName);
        ImportExportListService::updateRecord(
            $importId,
            [
                'status'                         => Status::PROCESSING,
                ImportExportList::COUNT['TOTAL'] => $totalRows
            ]
        );

        Config::addOption(Lead::CSV_FIELDS_PREFIX . $processId, $fields, true);

        (new LeadsCsvImportProcess())->push_to_queue(
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
