<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Config;
use BitApps\Crm\Constants\CommonConstant;
use BitApps\Crm\Constants\HookKeys;
use BitApps\Crm\Deps\BitApps\WPDatabase\Connection;
use BitApps\Crm\Deps\BitApps\WPKit\Helpers\Slug;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Helpers\Uuid;
use BitApps\Crm\HTTP\Requests\Deal\ShowRequest;
use BitApps\Crm\HTTP\Requests\Deal\StoreRequest;
use BitApps\Crm\HTTP\Requests\Deal\TrashRequest;
use BitApps\Crm\HTTP\Requests\Deal\UpdateRequest;
use BitApps\Crm\Interfaces\EntityDataInterface;
use BitApps\Crm\Interfaces\EntityFieldsInterface;
use BitApps\Crm\Model\Deal;
use BitApps\Crm\Model\Invoice;
use BitApps\Crm\Model\LineItem;
use BitApps\Crm\Model\Tag;
use BitApps\Crm\Model\TagEntity;
use BitApps\Crm\Model\Trash;
use BitApps\Crm\src\StaticData\CurrencyHelper;
use BitApps\Crm\src\StaticData\DealSystemDefinedFields;
use Exception;
use Throwable;

class DealService implements EntityDataInterface, EntityFieldsInterface
{
    public function store(array|Request $data): array
    {
        $rules = (new StoreRequest())->rules();
        $validated = CommonService::resolveValidatedData($data, $rules);

        if (isset($validated['errors'])) {
            return $validated;
        }

        $systemDefinedFieldsValues = $validated['systemDefinedFieldsValues'];
        $systemDefinedFieldsValues['reference_uuid'] = Uuid::generate();
        $systemDefinedFieldsValues['created_by'] = get_current_user_id();
        $systemDefinedFieldsValues = $this->convertCurrencies($systemDefinedFieldsValues);
        $systemDefinedFieldsValues['currency'] = $validated['currency'] ?? CurrencyHelper::getHomeCurrency();

        Connection::startTransaction();

        try {
            $storedDeal = Deal::insert($systemDefinedFieldsValues);
            $dealId = $storedDeal->id;

            if (!empty($validated['customFieldsValues'])) {
                Hooks::doAction(HookKeys::STORE_CUSTOM_FIELDS_VALUES, Deal::MODULE_NAME, $dealId, $validated['customFieldsValues']);
            }

            $attachedTagIds = $this->storeAndAttachTags($dealId, (array) ($validated['tagIds'] ?? []), (array) ($validated['newTagTitles'] ?? []));

            if (!empty($validated['lineItems'])) {
                $dealCurrency = $systemDefinedFieldsValues['currency'] ?? null;
                $taxOption = $systemDefinedFieldsValues['tax_option'] ?? LineItem::TAX_EXCLUSIVE;

                $lineItemService = new LineItemService($dealId, Deal::MODULE_NAME);
                $lineItemService->syncLineItems($validated['lineItems'], $dealCurrency, $taxOption);
            }

            Connection::commit();

            $storedDeal->reference_uuid = Uuid::binaryToUuid($storedDeal->reference_uuid);

            $storedDeal = CommonService::appendCustomFieldsValues($storedDeal, Deal::MODULE_NAME);
            Hooks::doAction('bit_crm/deal_created', $storedDeal);

            if (!empty($attachedTagIds)) {
                Hooks::doAction('bit_crm/tags_attached_to_deals', $attachedTagIds, [$dealId]);
            }

            return ['success' => true, 'data' => $storedDeal];
        } catch (Throwable $th) {
            Connection::rollback();

            return ['success' => false, 'errors' => [$th->getMessage() ?: __('Failed to create new deal!', 'bit-crm-sales-marketing-automation')]];
        }
    }

    public function show(array|Request $data): array
    {
        $rules = (new ShowRequest())->rules();
        $validated = CommonService::resolveValidatedData($data, $rules);

        if (isset($validated['errors'])) {
            return $validated;
        }

        $id = $validated['id'];
        $deal = Deal::findOne(['id' => $id, 'is_trash' => 0]);

        if (empty($deal)) {
            return ['success' => false, 'errors' => [__('Deal not found!', 'bit-crm-sales-marketing-automation')]];
        }

        $deal = $deal->getAttributes();

        CommonService::appendAuditUserNames($deal);
        $deal = Hooks::applyFilter(HookKeys::MERGE_CUSTOM_FIELDS, $deal, Deal::MODULE_NAME, $id, true);

        if ($tags = $this->getTags($id)) {
            $deal['tags'] = $tags;
        }

        $lineItemService = new LineItemService($id, Deal::MODULE_NAME);
        if ($lineItems = $lineItemService->getLineItems()) {
            $deal['lineItems'] = $lineItems;
        }

        if ([$previousId, $nextId] = $this->getPrevAndNextId($id)) {
            $deal[CommonConstant::ENTITY_PREVIOUS_ID] = $previousId;
            $deal[CommonConstant::ENTITY_NEXT_ID] = $nextId;
        }

        return ['success' => true, 'data' => $deal];
    }

    public function update(array|Request $data): array
    {
        $rules = CommonService::makeOnlyIdRequired((new UpdateRequest())->rules());
        $validated = CommonService::resolveValidatedData($data, $rules);

        if (isset($validated['errors'])) {
            return $validated;
        }

        $deal = new Deal($validated['id']);

        if (!$deal->id) {
            return ['success' => false, 'errors' => [__('Deal not found!', 'bit-crm-sales-marketing-automation')]];
        }

        $systemDefinedFieldsValues = $this->convertCurrencies($validated['systemDefinedFieldsValues']);

        Connection::startTransaction();

        try {
            $systemDefinedFieldsValues['updated_by'] = get_current_user_id();

            if (!$deal->update($systemDefinedFieldsValues)) {
                throw new Exception(__('Failed to update Deal.', 'bit-crm-sales-marketing-automation'));
            }

            Hooks::doAction(HookKeys::UPDATE_CUSTOM_FIELDS_VALUES, Deal::MODULE_NAME, $deal->id, $validated['customFieldsValues'] ?? []);

            if (isset($validated['lineItems'])) {
                $dealCurrency = $systemDefinedFieldsValues['currency'] ?? null;
                $taxOption = $systemDefinedFieldsValues['tax_option'] ?? LineItem::TAX_EXCLUSIVE;

                $lineItemService = new LineItemService($deal->id, Deal::MODULE_NAME);
                $lineItemService->syncLineItems($validated['lineItems'], $dealCurrency, $taxOption);
            }

            Connection::commit();

            $deal = CommonService::appendCustomFieldsValues($deal, Deal::MODULE_NAME);
            Hooks::doAction('bit_crm/deal_updated', $deal);

            return ['success' => true, 'data' => $deal, 'message' => __('Deal updated successfully.', 'bit-crm-sales-marketing-automation')];
        } catch (Throwable $th) {
            Connection::rollback();

            return ['success' => false, 'errors' => [$th->getMessage() ?: __('Failed to update Deal.', 'bit-crm-sales-marketing-automation')]];
        }
    }

    public function trash(array|Request $data): array
    {
        $rules = (new TrashRequest())->rules();
        $validated = CommonService::resolveValidatedData($data, $rules);

        if (isset($validated['errors'])) {
            return $validated;
        }

        $ids = $validated['ids'] ?? [];
        $deals = Deal::whereIn('id', $ids);
        $dealsData = $deals->get()->toArray();

        if (!\count($dealsData)) {
            return ['success' => false, 'errors' => [__('Deals not found', 'bit-crm-sales-marketing-automation')]];
        }

        $currentUserId = get_current_user_id();
        $trashData = array_map(
            fn ($deal) => [
                'entity_id'  => $deal['id'],
                'module'     => Deal::MODULE_NAME,
                'created_by' => $currentUserId,
                'full_name'  => trim($deal['name'])
            ],
            $dealsData
        );

        Connection::startTransaction();

        try {
            $updated = Deal::whereIn('id', $ids)->update(['is_trash' => true]);
            if (!$updated) {
                throw new Exception(__('Failed to mark deals as trashed.', 'bit-crm-sales-marketing-automation'));
            }
            Trash::insert($trashData);

            Connection::commit();
            Hooks::doAction('bit_crm/deals_trashed', $ids);

            $data = [];
            if (\count($ids) === 1) {
                if ([$previousId, $nextId] = $this->getPrevAndNextId($ids[0])) {
                    $data[CommonConstant::ENTITY_PREVIOUS_ID] = $previousId;
                    $data[CommonConstant::ENTITY_NEXT_ID] = $nextId;
                }
            }

            return ['success' => true, 'data' => $data, 'message' => __('Deleted successfully.', 'bit-crm-sales-marketing-automation')];
        } catch (Throwable $th) {
            Connection::rollback();

            return ['success' => false, 'errors' => [__('Failed to delete!', 'bit-crm-sales-marketing-automation')]];
        }
    }

    public function fields(): array
    {
        $systemFields = FieldService::mergeSystemFieldsWithDb(
            DealSystemDefinedFields::all(),
            Deal::SETTINGS_KEYS['FIELDS'],
        );

        $allFields = Hooks::applyFilter(HookKeys::FORMAT_CUSTOM_FIELDS, $systemFields, Deal::MODULE_NAME);

        return array_values($allFields);
    }

    /**
     * Get deal data by ID.
     *
     * @param int $dealId the ID of the deal to retrieve
     *
     * @return array|bool an associative array of deal data, or false if the deal is not found
     */
    public function findById(int $dealId): array|bool
    {
        $deal = Deal::findOne(['id' => $dealId]);

        if (empty($deal)) {
            return false;
        }

        $data = $deal->getAttributes();

        return Hooks::applyFilter(HookKeys::MERGE_CUSTOM_FIELDS, $data, Deal::MODULE_NAME, $dealId, false);
    }

    /**
     * Get the tags associated with a deal by its ID.
     *
     * @param int $id the ID of the deal
     *
     * @return bool|Collection the collection of tags associated with the deal, or false if no tags are found
     */
    public function getTags(int $id): array|bool
    {
        if (empty($id)) {
            return false;
        }

        $tagsTable = Config::withDBPrefix('tags');
        $tagEntityTable = Config::withDBPrefix('tag_entity');

        $tags = Tag::join('tag_entity', $tagEntityTable . '.tag_id', '=', $tagsTable . '.id')
            ->select($tagsTable . '.id', $tagsTable . '.title', $tagsTable . '.slug')
            ->where($tagsTable . '.module', Deal::MODULE_NAME)
            ->where($tagEntityTable . '.entity_id', $id)
            ->get();

        if (empty($tags)) {
            return false;
        }

        return $tags->toArray();
    }

    /**
     * Attaches tags to a deal, inserting only the links that don't already exist.
     *
     * @return array<int> the tag IDs newly attached to the deal (empty when nothing changed)
     */
    public function storeAndAttachTags(int $dealId, array $tagIds, array $newTagTitles): array
    {
        if (empty($dealId) || (empty($tagIds) && empty($newTagTitles))) {
            return [];
        }

        $newInsertedTagIds = self::storeNewTags($newTagTitles);
        $tagIds = array_merge($tagIds, $newInsertedTagIds);

        if (empty($tagIds)) {
            return [];
        }

        $existingTags = TagEntity::where('entity_id', $dealId)
            ->where('module', Deal::MODULE_NAME)
            ->whereIn('tag_id', $tagIds)
            ->get();
        $existingTagIds = !empty($existingTags) ? $existingTags->pluck('tag_id')->toArray() : [];

        $newTagIds = array_values(array_diff($tagIds, $existingTagIds));
        if (empty($newTagIds)) {
            return [];
        }

        $tagEntityData = array_map(
            function ($tagId) use ($dealId) {
                return [
                    'entity_id' => $dealId,
                    'tag_id'    => $tagId,
                    'module'    => Deal::MODULE_NAME,
                ];
            },
            $newTagIds
        );

        try {
            TagEntity::insert($tagEntityData);
        } catch (Throwable $th) {
            return [];
        }

        return $newTagIds;
    }

    public function detachTags(array|int $dealIds, array $tagIds): bool
    {
        if (empty($dealIds) || empty($tagIds)) {
            return false;
        }

        $dealIds = \is_array($dealIds) ? $dealIds : [$dealIds];

        $deletedTagEntities = TagEntity::whereIn('entity_id', $dealIds)
            ->whereIn('tag_id', $tagIds)
            ->where('module', Deal::MODULE_NAME)
            ->delete();

        if ($deletedTagEntities > 0) {
            Hooks::doAction('bit_crm/tags_detached_from_deals', $tagIds, $dealIds);

            return true;
        }

        return false;
    }

    public function search(array $params): array
    {
        $params = wp_parse_args(
            $params,
            [
                'searchTerm'           => '',
                'tags'                 => [],
                'offset'               => 0,
                'page'                 => 1,
                'perPage'              => 10,
                'sortBy'               => 'id',
                'sortOrder'            => 'asc',
                'advancedFilterGroups' => [],
            ]
        );

        return (new DealSearchService())->search($params);
    }

    public function getEntitiesAsOptions(array|bool $pagination = false, int $skipId = 0, ?string $searchTerm = null, ?array $args = []): array
    {
        $selectedColumns = array_merge(['id', 'name', 'email', 'contact_id'], $args['columnSelect'] ?? []);

        if (!$this->validateArguments($selectedColumns)) {
            return ['data' => []];
        }


        $deals = Deal::select(...$selectedColumns)
            ->where('is_trash', 0)
            ->when(
                $skipId,
                function ($query) use ($skipId) {
                    $query->where('id', '!=', $skipId);
                }
            )->when(
                $searchTerm,
                function ($query) use ($searchTerm) {
                    $query->where(
                        function ($q) use ($searchTerm) {
                            $q->where('name', 'LIKE', '%' . $searchTerm . '%');
                        }
                    );
                }
            )->orderBy('id')->desc();

        if (\is_array($pagination) && isset($pagination['pageNo'], $pagination['perPage'])) {
            $paginatedDeals = $deals->paginate($pagination['pageNo'], $pagination['perPage']);

            $options = [];
            foreach ($paginatedDeals['data'] as $deal) {
                $options[] = $this->buildOption($deal, $args['columnSelect'] ?? []);
            }

            $paginatedDeals['data'] = $options;

            return $paginatedDeals;
        }

        $allDeals = $deals->get();
        $options = [];

        foreach ($allDeals as $deal) {
            $options[] = $this->buildOption($deal, $args['columnSelect'] ?? []);
        }

        return $options;
    }

    public function getEntityAsOption(int $id, ?array $args = []): array|bool
    {
        $deal = Deal::select(['id', 'name'])->findOne(['id' => $id]);

        if (!$deal) {
            return false;
        }

        return [
            'value' => $deal->id,
            'label' => $deal->name,
        ];
    }

    public function getDisplayName(array $data): string
    {
        return $data['name'] ?? '';
    }

    public function getPrevAndNextId(int $id): array|bool
    {
        $dealsTable = Config::withDBPrefix('deals');

        return (new CommonService())->getPrevAndNextEntityId($dealsTable, $id);
    }

    public function convertCurrencies(array $fieldsValues): array
    {
        $currencyKeys = DealSystemDefinedFields::getFieldKeysByType('currency');
        $currency = $fieldsValues['currency'] ?? null;
        $currencyService = new CurrencyService();

        $values = [];
        foreach ($fieldsValues as $key => $value) {
            $values[$key] = $value;
            if (isset($currencyKeys[$key])) {
                $homeCurrencyKey = CurrencyHelper::COL_PREFIX_HOME_CURRENCY . $key;
                $values[$homeCurrencyKey] = $currencyService->convertIntoHomeCurrency((float) $value, $currency);
            }
        }

        return $values;
    }

    public function getIdsByColumn(string $column, $value): array|bool
    {
        if (empty($column) || empty($value)) {
            return false;
        }

        $deals = Deal::where($column, $value)->select(['id'])->get();

        if (empty($deals)) {
            return false;
        }

        return $deals->pluck('id')->toArray();
    }

    public function getIdsByColumnPaginated(string $column, $value, int $page, int $perPage): array
    {
        if (empty($column) || empty($value)) {
            return ['ids' => [], 'total' => 0];
        }

        $result = Deal::where($column, $value)->where('is_trash', 0)->select(['id'])->paginate($page, $perPage);
        $result['ids'] = empty($result['data']) ? [] : $result['data']->pluck('id')->toArray();

        return $result;
    }

    public function getModel(): string
    {
        return Deal::class;
    }

    public function getIdsWithAssociations(array $ids): array
    {
        if (empty($ids)) {
            return [];
        }

        $associatedDealsId = Invoice::whereIn('entity_id', $ids)
            ->where('module', Deal::MODULE_NAME)
            ->select(['entity_id'])
            ->groupBy('entity_id')
            ->get();

        return empty($associatedDealsId) ? [] : $associatedDealsId->pluck('entity_id')->toArray();
    }

    private function storeNewTags(array $newTagTitles): array
    {
        $newInsertedTagIds = [];

        if (empty($newTagTitles)) {
            return $newInsertedTagIds;
        }

        $newTagData = array_map(
            function ($title) {
                return [
                    'title'  => $title,
                    'slug'   => Slug::generate($title),
                    'module' => Deal::MODULE_NAME,
                ];
            },
            $newTagTitles
        );

        try {
            $insertedTags = Tag::insert($newTagData);

            foreach ($insertedTags as $tag) {
                if (!empty($tag->id)) {
                    $newInsertedTagIds[] = $tag->id;
                }
            }
        } catch (Throwable $th) {
        }

        return $newInsertedTagIds;
    }

    private function buildOption($deal, array $columnSelect): array
    {
        $option = [
            'value' => $deal->id,
            'label' => trim($deal->name),
        ];

        $currencyService = new CurrencyService();
        $currencies = $currencyService->getCurrencyMap();

        if (!empty($columnSelect)) {
            $data = [];
            foreach ($columnSelect as $column) {
                if ($column === 'currency') {
                    $data['currency'] = $currencies[$deal->currency];
                } elseif (isset($deal->{$column})) {
                    $data[$column] = $deal->{$column};
                }
            }
            $option['data'] = $data;
        }

        return $option;
    }

    private function validateArguments(array $args): bool
    {
        $keys = ['id', 'name', 'email', 'currency', 'contact_id'];

        foreach ($args as $arg) {
            if (!\in_array($arg, $keys)) {
                return false;
            }
        }

        return true;
    }
}
