<?php

namespace BitApps\Crm\HTTP\Controllers;

use BitApps\Crm\Config;
use BitApps\Crm\Constants\HookKeys;
use BitApps\Crm\Constants\Status;
use BitApps\Crm\Deps\BitApps\WPKit\Helpers\JSON;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Deps\BitApps\WPKit\Http\Response;
use BitApps\Crm\Helpers\FileHandler;
use BitApps\Crm\Helpers\Uuid;
use BitApps\Crm\HTTP\Requests\Deal\AttachTagRequest;
use BitApps\Crm\HTTP\Requests\Deal\AttachTagsRequest;
use BitApps\Crm\HTTP\Requests\Deal\DetachTagRequest;
use BitApps\Crm\HTTP\Requests\Deal\DetachTagsRequest;
use BitApps\Crm\HTTP\Requests\Deal\EditRequest;
use BitApps\Crm\HTTP\Requests\Deal\ImportRequest;
use BitApps\Crm\HTTP\Requests\Deal\SearchRequest;
use BitApps\Crm\HTTP\Requests\Deal\ShowDealContactCurrencyRequest;
use BitApps\Crm\HTTP\Requests\Deal\ShowRequest;
use BitApps\Crm\HTTP\Requests\Deal\StoreRequest;
use BitApps\Crm\HTTP\Requests\Deal\TrashRequest;
use BitApps\Crm\HTTP\Requests\Deal\UpdateRequest;
use BitApps\Crm\HTTP\Requests\Deal\UpdateStageRequest;
use BitApps\Crm\Model\Contact;
use BitApps\Crm\Model\Deal;
use BitApps\Crm\Model\ImportExportList;
use BitApps\Crm\Model\Tag;
use BitApps\Crm\Model\TagEntity;
use BitApps\Crm\Services\CurrencyService;
use BitApps\Crm\Services\DealKanbanSearchService;
use BitApps\Crm\Services\DealSearchService;
use BitApps\Crm\Services\DealService;
use BitApps\Crm\Services\ImportExportListService;
use BitApps\Crm\Services\LineItemService;
use BitApps\Crm\Services\SettingService;
use BitApps\Crm\Services\TagService;
use BitApps\Crm\src\Capability;
use BitApps\Crm\src\Queue\DealsCsvImportProcess;
use BitApps\Crm\src\StaticData\CurrencyHelper;
use BitApps\Crm\Utils\Logger;
use Throwable;

final class DealController
{
    public const DEFAULT_PER_PAGE = 10;

    private DealService $dealService;

    public function __construct()
    {
        $this->dealService = new DealService();
    }

    public function store(StoreRequest $request)
    {
        $result = $this->dealService->store($request);

        if (!$result['success']) {
            return Response::error($result['errors'][0]);
        }

        return Response::success($result['data']);
    }

    public function edit(EditRequest $request)
    {
        $validated = $request->validated();

        $deal = new Deal($validated['id']);
        if (!$deal->id) {
            return Response::error(__('Deal not found!', 'bit-crm'));
        }
        $dealData = $deal->getAttributes();

        $dealCurrencyData = Hooks::applyFilter(HookKeys::STORED_CURRENCY, null, $dealData['currency'] ?? '');
        if (!$dealCurrencyData) {
            $dealCurrencyData = CurrencyHelper::getHomeCurrencyData();
        }

        $lineItems = (new LineItemService($deal->id, Deal::MODULE_NAME))->getLineItems();
        $hasLineItems = !empty(array_filter(
            $lineItems,
            fn ($lineItem) => !empty($lineItem['product_id'])
        ));

        $response = [
            'deal'             => $dealData,
            'dealCurrencyData' => $dealCurrencyData,
            'hasLineItems'     => $hasLineItems,
        ];

        return Response::success($response);
    }

    public function show(ShowRequest $request)
    {
        $result = $this->dealService->show($request);

        if (!$result['success']) {
            return Response::error($result['errors'][0]);
        }

        return Response::success($result['data']);
    }

    public function update(UpdateRequest $request)
    {
        $result = $this->dealService->update($request);

        if (!$result['success']) {
            return Response::error($result['errors'][0]);
        }

        return Response::success($result['data'])->message($result['message']);
    }

    public function updateStage(UpdateStageRequest $request)
    {
        $validated = $request->validated();

        $deal = new Deal($validated['id']);
        if (!$deal->id) {
            return Response::error(__('Deal not found!', 'bit-crm'));
        }

        unset($validated['id']);

        if (isset($validated['amount']) && is_numeric($validated['amount'])) {
            $currencyService = new CurrencyService();
            $validated['home_currency_amount'] = $currencyService->convertIntoHomeCurrency(
                (float) $validated['amount'],
                $deal->currency
            );
        }

        $validated['updated_by'] = get_current_user_id();
        if (!$deal->update($validated)) {
            return Response::error(__('Failed to update deal stage.', 'bit-crm'));
        }

        Hooks::doAction('bit_crm/deal_stage_updated', $deal, $validated['stage']);

        return Response::success(__('Deal stage updated successfully.', 'bit-crm'));
    }

    public function search(SearchRequest $request)
    {
        $validated = $request->validated();
        $page = !empty($validated['page']) ? $validated['page'] : 1;
        $perPage = !empty($validated['perPage']) ? $validated['perPage'] : self::DEFAULT_PER_PAGE;
        $offset = ($page - 1) * $perPage;

        $args = [
            'page'                 => $page,
            'perPage'              => $perPage,
            'offset'               => $offset,
            'sortBy'               => !empty($validated['sortBy']) ? $validated['sortBy'] : 'id',
            'sortOrder'            => !empty($validated['sortOrder']) ? $validated['sortOrder'] : 'DESC',
            'searchTerm'           => $validated['searchTerm'],
            'tags'                 => !empty($validated['tags']) ? $validated['tags'] : [],
            'advancedFilterGroups' => !empty($validated['advancedFilterGroups']) ? $validated['advancedFilterGroups'] : [],
        ];

        if ($validated['table'] || $page > 1) {
            $searchService = new DealSearchService();
        } else {
            $searchService = new DealKanbanSearchService();
        }

        try {
            $data = $searchService->search($args);

            return Response::success($data);
        } catch (Throwable $th) {
            Logger::error($th);

            return Response::error(__('Failed to fetch deals!', 'bit-crm'));
        }
    }

    public function trash(TrashRequest $request)
    {
        $result = $this->dealService->trash($request);

        if (!$result['success']) {
            return Response::error($result['errors'][0]);
        }

        return Response::success($result['data'])->message($result['message']);
    }

    public function fieldsWithOrder()
    {
        $fieldsOrder = SettingService::getSettingsValue(Deal::SETTINGS_KEYS['FIELDS_ORDER']);
        $columnSettings = SettingService::getSettingsValue(Deal::SETTINGS_KEYS['COLUMNS_SETTINGS']);

        return Response::success(
            [
                'fields'          => $this->dealService->fields(),
                'orders'          => $fieldsOrder,
                'column_settings' => $columnSettings
            ]
        );
    }

    public function tableConfiguration()
    {
        $columnsOrder = SettingService::getSettingsValue(Deal::SETTINGS_KEYS['COLUMNS_ORDER']);
        $visibleColumns = SettingService::getSettingsValue(Deal::SETTINGS_KEYS['TABLE_VISIBLE_COLUMNS']);

        return Response::success(
            [
                'fields'          => $this->dealService->fields(),
                'orders'          => $columnsOrder,
                'visible_columns' => $visibleColumns
            ]
        );
    }

    public function attachTag(AttachTagRequest $request)
    {
        $validated = $request->validated();

        $dealId = $validated['deal_id'];
        $tag = Tag::findOne(['module' => Deal::MODULE_NAME, 'slug' => $validated['title']]);

        unset($validated['deal_id']);

        if (empty($tag) && Capability::check('bit_crm_tag_create')) {
            $tag = TagService::store(
                [
                    'title'  => $validated['title'],
                    'module' => Deal::MODULE_NAME
                ]
            );
        }

        if (empty($tag)) {
            return Response::error(__('Failed to add tag', 'bit-crm'));
        }

        $tagEntity = [
            'module'    => Deal::MODULE_NAME,
            'tag_id'    => $tag->id,
            'entity_id' => $dealId,
        ];

        if (TagEntity::findOne($tagEntity)) {
            return Response::success(__('Tag already added', 'bit-crm'));
        }

        if (TagEntity::insert($tagEntity)) {
            Hooks::doAction('bit_crm/tag_attached_to_deal', $tag, $dealId);

            return Response::success(__('Tag added successfully.', 'bit-crm'));
        }

        return Response::error(__('Failed to add tag.', 'bit-crm'));
    }

    public function detachTag(DetachTagRequest $request)
    {
        $validated = $request->validated();

        $tagId = $validated['tag_id'];
        $dealId = $validated['deal_id'];
        $tagEntity = TagEntity::where('tag_id', $tagId)
            ->where('entity_id', $dealId)
            ->where('module', Deal::MODULE_NAME);

        if (!$tagEntity->delete()) {
            return Response::error(__('Failed to remove tag', 'bit-crm'));
        }

        Hooks::doAction('bit_crm/tag_detached_from_deal', $tagId, $dealId);

        return Response::success(__('Tag removed successfully.', 'bit-crm'));
    }

    public function attachTags(AttachTagsRequest $request)
    {
        $validated = $request->validated();

        $dealIds = $validated['deal_ids'];
        $tagIds = $validated['tag_ids'];

        if (\count($dealIds) && \count($tagIds)) {
            $existingRecords = TagEntity::select(['entity_id', 'tag_id'])
                ->whereIn('entity_id', $dealIds)
                ->whereIn('tag_id', $tagIds)
                ->where('module', Deal::MODULE_NAME)
                ->get();

            $existingData = [];

            foreach ($existingRecords as $item) {
                $existingData[$item->entity_id][] = $item->tag_id;
            }

            $dataToInsert = [];

            foreach ($dealIds as $entityId) {
                foreach ($tagIds as $tagId) {
                    if (isset($existingData[$entityId]) && \in_array($tagId, $existingData[$entityId])) {
                        continue;
                    }

                    $dataToInsert[] = [
                        'entity_id' => $entityId,
                        'tag_id'    => $tagId,
                        'module'    => Deal::MODULE_NAME,
                    ];
                }
            }
        }

        if (empty($dataToInsert)) {
            return Response::error(__('Tags already added', 'bit-crm'));
        }

        TagEntity::insert($dataToInsert);

        Hooks::doAction('bit_crm/tags_attached_to_deals', $tagIds, $dealIds);

        return Response::success(__('Tag added successfully.', 'bit-crm'));
    }

    public function detachTags(DetachTagsRequest $request)
    {
        $validated = $request->validated();

        $dealIds = $validated['deal_ids'];
        $tagIds = $validated['tag_ids'];

        if (empty($dealIds) || empty($tagIds)) {
            return Response::error(__('Deals or tags not found', 'bit-crm'));
        }

        $deletedTagEntities = TagEntity::select(['entity_id', 'tag_id'])
            ->whereIn('entity_id', $dealIds)
            ->whereIn('tag_id', $tagIds)
            ->where('module', Deal::MODULE_NAME)
            ->delete();

        if (!$deletedTagEntities) {
            return Response::error(__('Failed to remove tags (tags not attached)', 'bit-crm'));
        }

        Hooks::doAction('bit_crm/tags_detached_from_deals', $tagIds, $dealIds);

        return Response::success(__('Tag removed successfully.', 'bit-crm'));
    }

    public function import(ImportRequest $request)
    {
        $validated = $request->validated();
        $files = $request->files();
        $file = $files['file'];

        if (!FileHandler::isFileType($file, 'csv')) {
            return Response::success(__('Only csv files are allowed.', 'bit-crm'));
        }

        $fields = JSON::maybeDecode($validated['fields'], true);
        $options = JSON::maybeDecode($validated['options'], true);
        $duplicateHandling = $options['duplicate_handling'] ?? Deal::DUPLICATE_SKIP;
        [$filePath, $fileName] = FileHandler::uploadFile($file, ImportExportList::IMPORT_DIR);
        $processId = Deal::IMPORT_PREFIX . Uuid::generate();
        $totalRows = FileHandler::getCsvRecordCount($filePath);

        $importId = ImportExportListService::createImportRecord($processId, Deal::MODULE_NAME, $fileName);
        ImportExportListService::updateRecord(
            $importId,
            [
                'status'                         => Status::PROCESSING,
                ImportExportList::COUNT['TOTAL'] => $totalRows
            ]
        );

        Config::addOption(Deal::CSV_FIELDS_PREFIX . $processId, $fields, true);

        (new DealsCsvImportProcess())->push_to_queue(
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

        return Response::success(__('Import started successfully in the background.', 'bit-crm'));
    }

    public function showDealContactCurrency(ShowDealContactCurrencyRequest $request)
    {
        $validated = $request->validated();

        $deal = Deal::findOne(['id' => $validated['id']]);

        if (empty($deal)) {
            return Response::error(__('Deal not found!', 'bit-crm'));
        }

        $contact = Contact::findOne(['id' => $deal['contact_id']]);

        if (empty($contact)) {
            return Response::error(__('Contact not found!', 'bit-crm'));
        }

        $currencyService = new CurrencyService();
        $currencies = $currencyService->getCurrencyMap();
        $currencyData = $currencies[$deal['currency']] ?? CurrencyHelper::getHomeCurrencyData();

        $response = [
            'deal'         => $deal,
            'contact'      => $contact,
            'currencyData' => $currencyData,
        ];

        return Response::success($response);
    }
}
