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
use BitApps\Crm\HTTP\Requests\Company\ShowRequest;
use BitApps\Crm\HTTP\Requests\Company\StoreRequest;
use BitApps\Crm\HTTP\Requests\Company\TrashRequest;
use BitApps\Crm\HTTP\Requests\Company\UpdateRequest;
use BitApps\Crm\Interfaces\EntityDataInterface;
use BitApps\Crm\Interfaces\EntityFieldsInterface;
use BitApps\Crm\Model\Company;
use BitApps\Crm\Model\Tag;
use BitApps\Crm\Model\TagEntity;
use BitApps\Crm\Model\Trash;
use BitApps\Crm\src\StaticData\CompanySystemDefinedFields;
use BitApps\Crm\src\StaticData\CurrencyHelper;
use Throwable;

class CompanyService implements EntityDataInterface, EntityFieldsInterface
{
    public function search(array $params): array
    {
        $params = wp_parse_args(
            $params,
            [
                'searchTerm' => '',
                'filters'    => [],
                'tags'       => [],
                'offset'     => 0,
                'page'       => 1,
                'perPage'    => 10,
                'sortBy'     => 'id',
                'sortOrder'  => 'asc'
            ]
        );

        return (new CompanySearchService())->search($params);
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
        $systemDefinedFieldsValues['currency'] = $validated['currency'] ?? CurrencyHelper::getHomeCurrency();
        Connection::startTransaction();

        try {
            $storedCompany = Company::insert($systemDefinedFieldsValues);

            if (!$storedCompany) {
                Connection::rollback();

                return ['success' => false, 'errors' => [__('Failed to create new company!', 'bit-crm-sales-marketing-automation')]];
            }

            $companyId = $storedCompany->id;

            if (!empty($validated['customFieldsValues'])) {
                Hooks::doAction(HookKeys::STORE_CUSTOM_FIELDS_VALUES, Company::MODULE_NAME, $companyId, $validated['customFieldsValues']);
            }

            $attachedTagIds = $this->storeAndAttachTags($companyId, $validated['tagIds'] ?? [], $validated['newTagTitles'] ?? []);

            Connection::commit();


            $storedCompany->reference_uuid = Uuid::binaryToUuid($storedCompany->reference_uuid);
            $storedCompany = CommonService::appendCustomFieldsValues($storedCompany, Company::MODULE_NAME);
            Hooks::doAction('bit_crm/company_created', $storedCompany);

            if (!empty($attachedTagIds)) {
                Hooks::doAction('bit_crm/tags_attached_to_companies', $attachedTagIds, [$companyId]);
            }

            return ['success' => true, 'data' => $storedCompany];
        } catch (Throwable $th) {
            Connection::rollback();

            return ['success' => false, 'errors' => [__('Failed to create new company!', 'bit-crm-sales-marketing-automation')]];
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
        $company = Company::findOne(['id' => $id, 'is_trash' => 0]);

        if (!$company) {
            return ['success' => false, 'errors' => [__('Company not found!', 'bit-crm-sales-marketing-automation')]];
        }

        $company = $company->getAttributes();

        CommonService::appendAuditUserNames($company);
        $company = Hooks::applyFilter(HookKeys::MERGE_CUSTOM_FIELDS, $company, Company::MODULE_NAME, $id, true);

        if ($tags = $this->getTags($id)) {
            $company['tags'] = $tags;
        }

        if ([$previousId, $nextId] = $this->getPrevAndNextId($id)) {
            $company[CommonConstant::ENTITY_PREVIOUS_ID] = $previousId;
            $company[CommonConstant::ENTITY_NEXT_ID] = $nextId;
        }

        return ['success' => true, 'data' => $company];
    }

    public function update(array|Request $data): array
    {
        $rules = CommonService::makeOnlyIdRequired((new UpdateRequest())->rules());
        $validated = CommonService::resolveValidatedData($data, $rules);

        if (isset($validated['errors'])) {
            return $validated;
        }

        $validated['systemDefinedFieldsValues']['updated_by'] = get_current_user_id();

        $company = Company::findOne(['id' => $validated['id'], 'is_trash' => 0]);
        if (!$company) {
            return ['success' => false, 'errors' => [__('Company not found!', 'bit-crm-sales-marketing-automation')]];
        }

        Connection::startTransaction();

        try {
            if (!$company->update($validated['systemDefinedFieldsValues'])) {
                return ['success' => false, 'errors' => [__('Failed to update Company.', 'bit-crm-sales-marketing-automation')]];
            }

            Hooks::doAction(HookKeys::UPDATE_CUSTOM_FIELDS_VALUES, Company::MODULE_NAME, $company->id, $validated['customFieldsValues'] ?? []);

            if (isset($validated['tagIds']) || isset($validated['newTagTitles'])) {
                $this->storeAndAttachTags(
                    $company->id,
                    (array) ($validated['tagIds'] ?? []),
                    (array) ($validated['newTagTitles'] ?? [])
                );
            }

            Connection::commit();
            $company = CommonService::appendCustomFieldsValues($company, Company::MODULE_NAME);
            Hooks::doAction('bit_crm/company_updated', $company);

            return ['success' => true, 'data' => $company, 'message' => __('Company updated successfully.', 'bit-crm-sales-marketing-automation')];
        } catch (Throwable $th) {
            Connection::rollback();

            return ['success' => false, 'errors' => [__('Failed to update Company.', 'bit-crm-sales-marketing-automation')]];
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
        $companies = Company::whereIn('id', $ids)->get();

        if (empty($companies)) {
            return ['success' => false, 'errors' => [__('Companies not found', 'bit-crm-sales-marketing-automation')]];
        }

        $skippedIds = $this->getIdsWithAssociations($ids);
        $trashableIds = array_values(array_diff($ids, $skippedIds));

        if (empty($trashableIds)) {
            return ['success' => false, 'errors' => [__('Cannot delete companies with associated deals or contacts.', 'bit-crm-sales-marketing-automation')]];
        }

        $trashableCompaniesData = array_values(
            array_filter($companies->toArray(), fn ($company) => \in_array($company['id'], $trashableIds))
        );

        $currentUserId = get_current_user_id();
        $trashData = array_map(
            fn ($company) => [
                'entity_id'  => $company['id'],
                'module'     => Company::MODULE_NAME,
                'created_by' => $currentUserId,
                'full_name'  => trim($company['name'])
            ],
            $trashableCompaniesData
        );

        Connection::startTransaction();

        try {
            Company::whereIn('id', $trashableIds)->update(['is_trash' => true]);
            Trash::insert($trashData);

            Connection::commit();
            Hooks::doAction('bit_crm/companies_trashed', $trashableIds);

            $data = [];
            if (\count($trashableIds) === 1) {
                if ([$previousId, $nextId] = $this->getPrevAndNextId($trashableIds[0])) {
                    $data[CommonConstant::ENTITY_PREVIOUS_ID] = $previousId;
                    $data[CommonConstant::ENTITY_NEXT_ID] = $nextId;
                }
            }

            $message = empty($skippedIds)
                ? __('Company deleted successfully.', 'bit-crm-sales-marketing-automation')
                : \sprintf(
                    // translators: 1: number of deleted companies, 2: number of skipped companies
                    __('%1$d company(s) deleted. %2$d company(s) skipped due to associated deals or contacts.', 'bit-crm-sales-marketing-automation'),
                    \count($trashableIds),
                    \count($skippedIds)
                );

            return ['success' => true, 'data' => $data, 'message' => $message];
        } catch (Throwable $th) {
            Connection::rollback();

            return ['success' => false, 'errors' => [__('Failed to delete!', 'bit-crm-sales-marketing-automation')]];
        }
    }

    public function findById(int $id): array|bool
    {
        $company = Company::findOne(['id' => $id]);

        if (empty($company)) {
            return false;
        }

        $data = $company->getAttributes();

        return Hooks::applyFilter(HookKeys::MERGE_CUSTOM_FIELDS, $data, Company::MODULE_NAME, $id, false);
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
            ->where($tagsTable . '.module', Company::MODULE_NAME)
            ->where($tagEntityTable . '.entity_id', $id)
            ->get();

        if (empty($tags)) {
            return false;
        }

        return $tags->toArray();
    }

    public function getEntitiesAsOptions(array|bool $pagination = false, int $skipId = 0, ?string $searchTerm = null, ?array $args = []): array
    {
        $columnSelect = $args['columnSelect'] ?? [];
        $columns = array_merge(['id', 'name'], $columnSelect);

        if (!$this->validateArguments($columns)) {
            return ['data' => []];
        }

        try {
            $companies = Company::select(...$columns)
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
                        $query->where('name', 'LIKE', '%' . $searchTerm . '%');
                    }
                )
                ->orderBy('id')->desc();

            if (\is_array($pagination) && isset($pagination['pageNo'], $pagination['perPage'])) {
                $paginatedCompanies = $companies->paginate($pagination['pageNo'], $pagination['perPage']);

                $options = [];
                foreach ($paginatedCompanies['data'] as $company) {
                    $options[] = $this->buildOption($company, $columnSelect);
                }

                $paginatedCompanies['data'] = $options;

                return $paginatedCompanies;
            }

            $allCompanies = $companies->get();
            $options = [];

            foreach ($allCompanies as $company) {
                $options[] = $this->buildOption($company, $columnSelect);
            }

            return $options;
        } catch (Throwable $th) {
            return ['data' => []];
        }
    }

    public function getEntityAsOption(int $id, ?array $args = []): array|bool
    {
        $columnSelect = $args['columnSelect'] ?? [];
        $selectColumns = array_merge(['id', 'name'], $columnSelect);

        if (!$this->validateArguments($selectColumns)) {
            return ['data' => []];
        }

        try {
            $company = Company::select(...$selectColumns)->findOne(['id' => $id]);
        } catch (Throwable $th) {
            return false;
        }

        if (!$company) {
            return false;
        }

        return $this->buildOption($company, $columnSelect);
    }

    public function getDisplayName(array $data): string
    {
        return $data['name'] ?? '';
    }

    public function getPrevAndNextId(int $id): array|bool
    {
        $companiesTable = Config::withDBPrefix('companies');

        return (new CommonService())->getPrevAndNextEntityId($companiesTable, $id);
    }

    public function getIdsByColumn(string $column, $value): array|bool
    {
        if (empty($column) || empty($value)) {
            return false;
        }

        $companies = Company::where($column, $value)->select(['id'])->get();

        if (empty($companies)) {
            return false;
        }

        return $companies->pluck('id')->toArray();
    }

    public function getIdsByColumnPaginated(string $column, $value, int $page, int $perPage): array
    {
        if (empty($column) || empty($value)) {
            return ['ids' => [], 'total' => 0];
        }

        $result = Company::where($column, $value)->where('is_trash', 0)->select(['id'])->paginate($page, $perPage);
        $result['ids'] = empty($result['data']) ? [] : $result['data']->pluck('id')->toArray();

        return $result;
    }

    public function getModel(): string
    {
        return Company::class;
    }

    public function fields(): array
    {
        $systemFields = FieldService::mergeSystemFieldsWithDb(
            CompanySystemDefinedFields::all(),
            Company::SETTINGS_KEYS['FIELDS'],
            CompanySystemDefinedFields::getGroupKeys()
        );

        $allFields = Hooks::applyFilter(HookKeys::FORMAT_CUSTOM_FIELDS, $systemFields, Company::MODULE_NAME);

        return array_values($allFields);
    }

    /**
     * Attaches tags to a company, inserting only the links that don't already exist.
     *
     * @return array<int> the tag IDs newly attached to the company (empty when nothing changed)
     */
    public function storeAndAttachTags(int $companyId, array $tagIds, array $newTagTitles): array
    {
        if (empty($companyId) || (empty($tagIds) && empty($newTagTitles))) {
            return [];
        }

        $newInsertedTagIds = $this->storeNewTags($newTagTitles);
        $tagIds = array_merge($tagIds, $newInsertedTagIds);

        if (empty($tagIds)) {
            return [];
        }

        $existingTags = TagEntity::where('entity_id', $companyId)
            ->where('module', Company::MODULE_NAME)
            ->whereIn('tag_id', $tagIds)
            ->get();
        $existingTagIds = !empty($existingTags) ? $existingTags->pluck('tag_id')->toArray() : [];

        $newTagIds = array_values(array_diff($tagIds, $existingTagIds));
        if (empty($newTagIds)) {
            return [];
        }

        $tagEntityData = array_map(
            function ($tagId) use ($companyId) {
                return [
                    'entity_id' => $companyId,
                    'tag_id'    => $tagId,
                    'module'    => Company::MODULE_NAME,
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

    public function findOrCreateByName(string $name): array|bool
    {
        if (empty($name)) {
            return false;
        }

        $company = Company::findOne(['name' => $name, 'is_trash' => 0]);

        if (empty($company)) {
            return $this->createByName($name);
        }

        return $company->getAttributes();
    }

    public function getIdsWithAssociations(array $ids): array
    {
        if (empty($ids)) {
            return [];
        }

        $contactsTable = Config::withDBPrefix('contacts');
        $dealsTable = Config::withDBPrefix('deals');
        $companiesTable = Config::withDBPrefix('companies');

        $associatedIds = Company::whereIn('id', $ids)
            ->leftJoin('contacts', "{$companiesTable}.id", '=', "{$contactsTable}.company_id")
            ->leftJoin('deals', "{$companiesTable}.id", '=', "{$dealsTable}.company_id")
            ->where(
                function ($query) use ($contactsTable, $dealsTable) {
                    $query->whereNotNull("{$contactsTable}.id")
                        ->orWhereRaw("{$dealsTable}.id IS NOT NULL");
                }
            )
            ->select(["{$companiesTable}.id"])
            ->groupBy("{$companiesTable}.id")
            ->get(["{$companiesTable}.id"]);

        return empty($associatedIds) ? [] : $associatedIds->pluck('id')->toArray();
    }

    public function detachTags(array|int $companyId, array $tagIds): bool
    {
        if (empty($companyId) || empty($tagIds)) {
            return false;
        }

        $companyId = \is_array($companyId) ? $companyId : [$companyId];

        $deletedTagEntities = TagEntity::whereIn('entity_id', $companyId)
            ->whereIn('tag_id', $tagIds)
            ->where('module', Company::MODULE_NAME)
            ->delete();

        if ($deletedTagEntities > 0) {
            Hooks::doAction('bit_crm/tags_detached_from_companies', $tagIds, $companyId);

            return true;
        }

        return false;
    }

    private function createByName(string $name): array|bool
    {
        if (empty($name)) {
            return false;
        }

        try {
            $company = Company::insert(
                [
                    'name'           => $name,
                    'reference_uuid' => Uuid::uuidToBinary(Uuid::generate()),
                    'created_by'     => get_current_user_id(),
                ]
            );

            if (!$company) {
                return false;
            }

            return $company->getAttributes();
        } catch (Throwable $th) {
            return false;
        }
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
                    'module' => Company::MODULE_NAME,
                ];
            },
            $newTagTitles
        );

        $newTagSlugs = array_column($newTagData, 'slug');

        $existingTags = Tag::whereIn('slug', $newTagSlugs)
            ->where('module', Company::MODULE_NAME)
            ->get();

        $existingTagSlugs = !empty($existingTags) ? $existingTags->pluck('slug')->toArray() : [];
        $existingTagIds = !empty($existingTags) ? $existingTags->pluck('id')->toArray() : [];
        $existingSlugLookup = array_flip($existingTagSlugs);

        $newTagData = array_filter(
            $newTagData,
            static function ($tag) use ($existingSlugLookup) {
                return !isset($existingSlugLookup[$tag['slug']]);
            }
        );

        if (empty($newTagData)) {
            return $existingTagIds;
        }

        $newTagData = array_values($newTagData);

        try {
            $insertedTags = Tag::insert($newTagData);

            foreach ($insertedTags as $tag) {
                if (!empty($tag->id)) {
                    $newInsertedTagIds[] = $tag->id;
                }
            }
        } catch (Throwable $th) {
        }

        return array_merge($existingTagIds, $newInsertedTagIds);
    }

    private function buildOption($company, array $columnSelect): array
    {
        $option = [
            'value' => $company->id,
            'label' => $company->name,
        ];

        if (!empty($columnSelect)) {
            $data = [];
            foreach ($columnSelect as $column) {
                if (isset($company->{$column})) {
                    $data[$column] = $company->{$column};
                }
            }
            $option['data'] = $data;
        }

        return $option;
    }

    private function validateArguments(array $args): bool
    {
        static $keys = null;
        if ($keys === null) {
            $keys = array_merge(['id'], CompanySystemDefinedFields::getAllFieldKeys());
        }

        return empty(array_diff($args, $keys));
    }
}
