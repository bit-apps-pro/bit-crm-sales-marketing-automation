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
use BitApps\Crm\HTTP\Requests\Lead\ShowRequest;
use BitApps\Crm\HTTP\Requests\Lead\StoreRequest;
use BitApps\Crm\HTTP\Requests\Lead\TrashRequest;
use BitApps\Crm\HTTP\Requests\Lead\UpdateRequest;
use BitApps\Crm\Interfaces\EntityDataInterface;
use BitApps\Crm\Interfaces\EntityFieldsInterface;
use BitApps\Crm\Model\Lead;
use BitApps\Crm\Model\Tag;
use BitApps\Crm\Model\TagEntity;
use BitApps\Crm\Model\Trash;
use BitApps\Crm\src\StaticData\LeadSystemDefinedFields;
use Throwable;

class LeadService implements EntityDataInterface, EntityFieldsInterface
{
    public function search(array $params): array
    {
        $params = wp_parse_args(
            $params,
            [
                'searchTerm'           => '',
                'filters'              => [],
                'tags'                 => [],
                'offset'               => 0,
                'page'                 => 1,
                'perPage'              => 10,
                'sortBy'               => 'id',
                'sortOrder'            => 'asc',
                'ids'                  => [],
                'advancedFilterGroups' => [],
            ]
        );

        return (new LeadSearchService())->search($params);
    }

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
        Connection::startTransaction();

        try {
            $storedLead = Lead::insert($systemDefinedFieldsValues);

            if (!$storedLead) {
                Connection::rollback();

                return ['success' => false, 'errors' => [__('Failed to create new lead!', 'bit-crm-sales-marketing-automation')]];
            }

            $leadId = $storedLead->id;

            if (!empty($validated['customFieldsValues'])) {
                Hooks::doAction(HookKeys::STORE_CUSTOM_FIELDS_VALUES, Lead::MODULE_NAME, $leadId, $validated['customFieldsValues']);
            }

            $this->storeAndAttachTags($leadId, $validated['tagIds'] ?? [], $validated['newTagTitles'] ?? []);

            Connection::commit();
            Hooks::doAction('bit_crm/lead_created', $storedLead);

            return ['success' => true, 'data' => $storedLead];
        } catch (Throwable $th) {
            Connection::rollback();

            return ['success' => false, 'errors' => [__('Failed to create new lead!', 'bit-crm-sales-marketing-automation')]];
        }
    }

    public function show(array|Request $id): array
    {
        $rules = (new ShowRequest())->rules();
        $validated = CommonService::resolveValidatedData($id, $rules);

        if (isset($validated['errors'])) {
            return $validated;
        }

        $id = $validated['id'];
        $lead = Lead::findOne(['id' => $id, 'is_trash' => 0, 'is_converted' => 0]);

        if (!$lead) {
            return ['success' => false, 'errors' => [__('Lead not found!', 'bit-crm-sales-marketing-automation')]];
        }

        $lead = $lead->getAttributes();

        CommonService::appendAuditUserNames($lead);
        $lead = Hooks::applyFilter(HookKeys::MERGE_CUSTOM_FIELDS, $lead, Lead::MODULE_NAME, $id, true);

        if ($tags = $this->getTags($id)) {
            $lead['tags'] = $tags;
        }

        if ([$previousId, $nextId] = $this->getPrevAndNextId($id)) {
            $lead[CommonConstant::ENTITY_PREVIOUS_ID] = $previousId;
            $lead[CommonConstant::ENTITY_NEXT_ID] = $nextId;
        }

        return ['success' => true, 'data' => $lead];
    }

    public function update(array|Request $data): array
    {
        $rules = (new UpdateRequest())->rules();
        $validated = CommonService::resolveValidatedData($data, $rules);

        if (isset($validated['errors'])) {
            return $validated;
        }

        $validated['systemDefinedFieldsValues']['updated_by'] = get_current_user_id();

        $lead = Lead::findOne(['id' => $validated['id'], 'is_trash' => 0]);
        if (!$lead) {
            return ['success' => false, 'errors' => [__('Lead not found!', 'bit-crm-sales-marketing-automation')]];
        }

        Connection::startTransaction();

        try {
            if (!$lead->update($validated['systemDefinedFieldsValues'])) {
                Connection::rollback();

                return ['success' => false, 'errors' => [__('Failed to update Lead.', 'bit-crm-sales-marketing-automation')]];
            }

            Hooks::doAction(HookKeys::UPDATE_CUSTOM_FIELDS_VALUES, Lead::MODULE_NAME, $lead->id, $validated['customFieldsValues'] ?? []);

            Connection::commit();
            Hooks::doAction('bit_crm/lead_updated', $lead);

            return ['success' => true, 'data' => $lead, 'message' => __('Lead updated successfully.', 'bit-crm-sales-marketing-automation')];
        } catch (Throwable $th) {
            Connection::rollback();

            return ['success' => false, 'errors' => [__('Failed to update Lead.', 'bit-crm-sales-marketing-automation')]];
        }
    }

    public function trash(array|Request $ids): array
    {
        $rules = (new TrashRequest())->rules();
        $validated = CommonService::resolveValidatedData($ids, $rules);

        if (isset($validated['errors'])) {
            return $validated;
        }

        $ids = $validated['ids'] ?? [];

        $leads = Lead::whereIn('id', $ids)->where('is_trash', 0);
        $leadsData = $leads->get()->toArray();

        if (!\count($leadsData)) {
            return ['success' => false, 'errors' => [__('Leads not found!', 'bit-crm-sales-marketing-automation')]];
        }

        $currentUserId = get_current_user_id();

        $trashData = array_map(
            fn ($lead) => [
                'entity_id'  => $lead['id'],
                'module'     => Lead::MODULE_NAME,
                'created_by' => $currentUserId,
                'full_name'  => trim($lead['first_name'] . ' ' . $lead['last_name'])
            ],
            $leadsData
        );

        Connection::startTransaction();

        try {
            $leads->update(['is_trash' => true]);
            Trash::insert($trashData);

            Connection::commit();
            Hooks::doAction('bit_crm/leads_trashed', $ids);

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

    public function findById(int $id): array|bool
    {
        $lead = Lead::findOne(['id' => $id]);

        if (empty($lead)) {
            return false;
        }

        $data = $lead->getAttributes();

        return Hooks::applyFilter(HookKeys::MERGE_CUSTOM_FIELDS, $data, Lead::MODULE_NAME, $id, false);
    }

    public function getTags(int $id): array|bool
    {
        if (empty($id)) {
            return false;
        }

        $tagsTable = Config::withDBPrefix('tags');
        $tagEntityTable = Config::withDBPrefix('tag_entity');

        $tags = Tag::join('tag_entity', $tagEntityTable . '.tag_id', '=', $tagsTable . '.id')
            ->select($tagsTable . '.id', $tagsTable . '.title', $tagsTable . '.slug')
            ->where($tagsTable . '.module', Lead::MODULE_NAME)
            ->where($tagEntityTable . '.entity_id', $id)
            ->get();

        if (empty($tags)) {
            return false;
        }

        return $tags->toArray();
    }

    public function getEntitiesAsOptions(array|bool $pagination = false, int $skipId = 0, ?string $searchTerm = null, ?array $args = []): array
    {
        $leads = Lead::select(['id', 'first_name', 'last_name'])
            ->where('is_converted', 0)
            ->where('is_trash', 0)
            ->when(
                $skipId,
                function ($query) use ($skipId) {
                    $query->where('id', '!=', $skipId);
                }
            )
            ->when(
                $searchTerm,
                function ($query) use ($searchTerm) {
                    $query->where(
                        function ($q) use ($searchTerm) {
                            $q->where('first_name', 'like', '%' . $searchTerm . '%')
                                ->orWhere('last_name', 'like', '%' . $searchTerm . '%');
                        }
                    );
                }
            )
            ->orderBy('id')->desc();


        if (\is_array($pagination) && isset($pagination['pageNo'], $pagination['perPage'])) {
            $paginatedLeads = $leads->paginate($pagination['pageNo'], $pagination['perPage']);

            $options = [];

            foreach ($paginatedLeads['data'] as $lead) {
                $options[] = [
                    'value' => $lead->id,
                    'label' => trim($lead->first_name . ' ' . $lead->last_name),
                ];
            }

            $paginatedLeads['data'] = $options;

            return $paginatedLeads;
        }

        $allLeads = $leads->get();
        $options = [];

        foreach ($allLeads as $lead) {
            $options[] = [
                'value' => $lead->id,
                'label' => trim($lead->first_name . ' ' . $lead->last_name),
            ];
        }

        return $options;
    }

    public function getEntityAsOption(int $id, ?array $args = []): array|bool
    {
        $lead = Lead::select(['id', 'first_name', 'last_name'])->findOne(['id' => $id]);

        if (!$lead) {
            return false;
        }

        return [
            'value' => $lead->id,
            'label' => trim($lead->first_name . ' ' . $lead->last_name),
        ];
    }

    public function getDisplayName(array $data): string
    {
        if (empty($data)) {
            return '';
        }

        $title = $data['title'] ?? '';
        $firstName = $data['first_name'] ?? '';
        $lastName = $data['last_name'] ?? '';

        return trim("{$title} {$firstName} {$lastName}");
    }

    public function getPrevAndNextId(int $id): array|bool
    {
        $leadsTable = Config::withDBPrefix('leads');

        return (new CommonService())->getPrevAndNextEntityId($leadsTable, $id);
    }

    public function getIdsByColumn(string $column, $value): array|bool
    {
        if (empty($column) || empty($value)) {
            return false;
        }

        $leads = Lead::where($column, $value)->select(['id'])->get();

        if (empty($leads)) {
            return false;
        }

        return $leads->pluck('id')->toArray();
    }

    public function getIdsByColumnPaginated(string $column, $value, int $page, int $perPage): array
    {
        if (empty($column) || empty($value)) {
            return ['ids' => [], 'total' => 0];
        }

        $result = Lead::where($column, $value)->where('is_trash', 0)->select(['id'])->paginate($page, $perPage);
        $result['ids'] = empty($result['data']) ? [] : $result['data']->pluck('id')->toArray();

        return $result;
    }

    public function getModel(): string
    {
        return Lead::class;
    }

    public function fields(): array
    {
        $systemFields = FieldService::mergeSystemFieldsWithDb(LeadSystemDefinedFields::all(), Lead::SETTINGS_KEYS['FIELDS'], LeadSystemDefinedFields::getGroupKeys());

        $allFields = Hooks::applyFilter(HookKeys::FORMAT_CUSTOM_FIELDS, $systemFields, Lead::MODULE_NAME);

        return array_values($allFields);
    }

    public function storeAndAttachTags(int $leadId, array $tagIds, array $newTagTitles)
    {
        if (empty($leadId) || (empty($tagIds) && empty($newTagTitles))) {
            return;
        }

        $newInsertedTagIds = $this->storeNewTags($newTagTitles);
        $tagIds = array_merge($tagIds, $newInsertedTagIds);

        if (empty($tagIds)) {
            return;
        }

        $tagEntityData = array_map(
            function ($tagId) use ($leadId) {
                return [
                    'entity_id' => $leadId,
                    'tag_id'    => $tagId,
                    'module'    => Lead::MODULE_NAME,
                ];
            },
            $tagIds
        );

        try {
            TagEntity::insert($tagEntityData);
        } catch (Throwable $th) {
        }
    }

    public static function getTagsByIds($leadIds, $unique = false)
    {
        $tagTable = Config::withDBPrefix('tags');
        $tagEntityTable = Config::withDBPrefix('tag_entity');

        $tagsQuery = TagEntity::whereIn('entity_id', $leadIds)
            ->where('module', Lead::MODULE_NAME)
            ->join('tags', "{$tagTable}.id", '=', "{$tagEntityTable}.tag_id")
            ->when(
                $unique,
                function ($query) use ($tagTable) {
                    return $query->groupBy("{$tagTable}.slug")
                        ->select(
                            [
                                "MAX({$tagTable}.id) as tag_id",
                                "MAX({$tagTable}.title) as title",
                                "{$tagTable}.slug",
                            ]
                        );
                },
                function ($query) use ($tagTable, $tagEntityTable) {
                    $query->select(
                        [
                            "{$tagTable}.slug",
                            "{$tagEntityTable}.entity_id as lead_id",
                        ]
                    );
                }
            );

        if (!$tagsQuery->count()) {
            return [];
        }

        return $tagsQuery->get()->toArray();
    }

    private static function storeNewTags(array $newTagTitles): array
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
                    'module' => Lead::MODULE_NAME,
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
}
