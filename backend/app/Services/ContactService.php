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
use BitApps\Crm\HTTP\Requests\Contact\ShowRequest;
use BitApps\Crm\HTTP\Requests\Contact\StoreRequest;
use BitApps\Crm\HTTP\Requests\Contact\TrashRequest;
use BitApps\Crm\HTTP\Requests\Contact\UpdateRequest;
use BitApps\Crm\Interfaces\EntityDataInterface;
use BitApps\Crm\Interfaces\EntityFieldsInterface;
use BitApps\Crm\Model\Contact;
use BitApps\Crm\Model\Deal;
use BitApps\Crm\Model\Tag;
use BitApps\Crm\Model\TagEntity;
use BitApps\Crm\Model\Trash;
use BitApps\Crm\src\StaticData\ContactSystemDefinedFields;
use Throwable;

class ContactService implements EntityDataInterface, EntityFieldsInterface
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
                'sortOrder'  => 'asc',
                'ids'        => [],
            ]
        );

        return (new ContactSearchService())->search($params);
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
            $storedContact = Contact::insert($systemDefinedFieldsValues);

            if (!$storedContact) {
                Connection::rollback();

                return ['success' => false, 'errors' => [__('Failed to create new contact!', 'bit-crm')]];
            }

            $contactId = $storedContact->id;

            if (!empty($validated['customFieldsValues'])) {
                Hooks::doAction(HookKeys::STORE_CUSTOM_FIELDS_VALUES, Contact::MODULE_NAME, $contactId, $validated['customFieldsValues']);
            }

            $this->storeAndAttachTags($contactId, $validated['tagIds'] ?? [], $validated['newTagTitles'] ?? []);

            Connection::commit();
            Hooks::doAction('bit_crm/contact_created', $storedContact);

            return ['success' => true, 'data' => $storedContact];
        } catch (Throwable $th) {
            Connection::rollback();

            return ['success' => false, 'errors' => [__('Failed to create new contact!', 'bit-crm')]];
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
        $contact = Contact::findOne(['id' => $id, 'is_trash' => 0]);

        if (!$contact) {
            return ['success' => false, 'errors' => [__('Contact not found!', 'bit-crm')]];
        }

        $contact = $contact->getAttributes();

        CommonService::appendAuditUserNames($contact);
        $contact = Hooks::applyFilter(HookKeys::MERGE_CUSTOM_FIELDS, $contact, Contact::MODULE_NAME, $id, true);

        if ($tags = $this->getTags($id)) {
            $contact['tags'] = $tags;
        }

        if ([$previousId, $nextId] = $this->getPrevAndNextId($id)) {
            $contact[CommonConstant::ENTITY_PREVIOUS_ID] = $previousId;
            $contact[CommonConstant::ENTITY_NEXT_ID] = $nextId;
        }

        return ['success' => true, 'data' => $contact];
    }

    public function update(array|Request $data): array
    {
        $rules = (new UpdateRequest())->rules();
        $validated = CommonService::resolveValidatedData($data, $rules);

        if (isset($validated['errors'])) {
            return $validated;
        }

        $validated['systemDefinedFieldsValues']['updated_by'] = get_current_user_id();

        $contact = Contact::findOne(['id' => $validated['id'], 'is_trash' => 0]);
        if (!$contact) {
            return ['success' => false, 'errors' => [__('Contact not found!', 'bit-crm')]];
        }

        Connection::startTransaction();

        try {
            if (!$contact->update($validated['systemDefinedFieldsValues'])) {
                Connection::rollback();

                return ['success' => false, 'errors' => [__('Failed to update contact.', 'bit-crm')]];
            }

            Hooks::doAction(HookKeys::UPDATE_CUSTOM_FIELDS_VALUES, Contact::MODULE_NAME, $contact->id, $validated['customFieldsValues'] ?? []);

            Connection::commit();
            Hooks::doAction('bit_crm/contact_updated', $contact);

            return ['success' => true, 'data' => $contact, 'message' => __('Contact updated successfully.', 'bit-crm')];
        } catch (Throwable $th) {
            Connection::rollback();

            return ['success' => false, 'errors' => [__('Failed to update contact.', 'bit-crm')]];
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

        $contacts = Contact::whereIn('id', $ids)->get();

        if (empty($contacts)) {
            return ['success' => false, 'errors' => [__('Contacts not found', 'bit-crm')]];
        }

        $skippedIds = $this->getIdsWithAssociations($ids);
        $trashableIds = array_values(array_diff($ids, $skippedIds));

        if (empty($trashableIds)) {
            return ['success' => false, 'errors' => [__('Failed to move contacts to trash. Please remove associations with deals before deleting.', 'bit-crm')]];
        }

        $trashableContactsData = array_values(
            array_filter($contacts->toArray(), fn ($contact) => \in_array($contact['id'], $trashableIds))
        );

        $currentUserId = get_current_user_id();
        $trashData = array_map(
            fn ($contact) => [
                'entity_id'  => $contact['id'],
                'module'     => Contact::MODULE_NAME,
                'created_by' => $currentUserId,
                'full_name'  => trim($contact['first_name'] . ' ' . $contact['last_name'])
            ],
            $trashableContactsData
        );

        Connection::startTransaction();

        try {
            Contact::whereIn('id', $trashableIds)->update(['is_trash' => true]);
            Trash::insert($trashData);

            Connection::commit();
            Hooks::doAction('bit_crm/contacts_trashed', $trashableIds);

            $data = [];
            if (\count($trashableIds) === 1) {
                if ([$previousId, $nextId] = $this->getPrevAndNextId($trashableIds[0])) {
                    $data[CommonConstant::ENTITY_PREVIOUS_ID] = $previousId;
                    $data[CommonConstant::ENTITY_NEXT_ID] = $nextId;
                }
            }

            $message = empty($skippedIds)
                ? __('Contact deleted successfully.', 'bit-crm')
                : \sprintf(
                    // translators: 1: number of deleted contacts, 2: number of skipped contacts
                    __('%1$d contact(s) deleted. %2$d contact(s) skipped due to associated deals.', 'bit-crm'),
                    \count($trashableIds),
                    \count($skippedIds)
                );

            return ['success' => true, 'data' => $data, 'message' => $message];
        } catch (Throwable $th) {
            Connection::rollback();

            return ['success' => false, 'errors' => [__('Failed to delete!', 'bit-crm')]];
        }
    }

    public function findById(int $id): array|bool
    {
        $contact = Contact::findOne(['id' => $id]);

        if (empty($contact)) {
            return false;
        }

        $data = $contact->getAttributes();

        return Hooks::applyFilter(HookKeys::MERGE_CUSTOM_FIELDS, $data, Contact::MODULE_NAME, $id, false);
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
            ->where($tagsTable . '.module', Contact::MODULE_NAME)
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
        $columns = array_merge(['id', 'first_name', 'last_name'], $columnSelect);

        if (!$this->validateArguments($columns)) {
            return ['data' => []];
        }

        try {
            $contacts = Contact::select(...$columns)
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
                                $q->where('first_name', 'LIKE', '%' . $searchTerm . '%')
                                    ->orWhere('last_name', 'LIKE', '%' . $searchTerm . '%');
                            }
                        );
                    }
                )
                ->orderBy('id')->desc();

            if (\is_array($pagination) && isset($pagination['pageNo'], $pagination['perPage'])) {
                $paginatedContacts = $contacts->paginate($pagination['pageNo'], $pagination['perPage']);

                $options = [];
                foreach ($paginatedContacts['data'] as $contact) {
                    $options[] = $this->buildOption($contact, $columnSelect);
                }

                $paginatedContacts['data'] = $options;

                return $paginatedContacts;
            }

            $allContacts = $contacts->get();
            $options = [];

            foreach ($allContacts as $contact) {
                $options[] = $this->buildOption($contact, $columnSelect);
            }

            return $options;
        } catch (Throwable $th) {
            return ['data' => []];
        }
    }

    public function getEntityAsOption(int $id, ?array $args = []): array|bool
    {
        $columnSelect = $args['columnSelect'] ?? [];
        $selectColumns = array_merge(['id', 'first_name', 'last_name'], $columnSelect);

        if (!$this->validateArguments($selectColumns)) {
            return ['data' => []];
        }

        try {
            $contact = Contact::select(...$selectColumns)->findOne(['id' => $id]);
        } catch (Throwable $th) {
            return false;
        }

        if (!$contact) {
            return false;
        }

        return $this->buildOption($contact, $columnSelect);
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
        $contactsTable = Config::withDBPrefix('contacts');

        return (new CommonService())->getPrevAndNextEntityId($contactsTable, $id);
    }

    public function fields(): array
    {
        $systemFields = FieldService::mergeSystemFieldsWithDb(ContactSystemDefinedFields::all(), Contact::SETTINGS_KEYS['FIELDS'], ContactSystemDefinedFields::getGroupKeys());

        $allFields = Hooks::applyFilter(HookKeys::FORMAT_CUSTOM_FIELDS, $systemFields, Contact::MODULE_NAME);

        return array_values($allFields);
    }

    public function storeAndAttachTags(int $contactId, array $tagIds, array $newTagTitles)
    {
        if (empty($contactId) || (empty($tagIds) && empty($newTagTitles))) {
            return;
        }

        $newInsertedTagIds = $this->storeNewTags($newTagTitles);
        $tagIds = array_merge($tagIds, $newInsertedTagIds);

        if (empty($tagIds)) {
            return;
        }

        $tagEntityData = array_map(
            function ($tagId) use ($contactId) {
                return [
                    'entity_id' => $contactId,
                    'tag_id'    => $tagId,
                    'module'    => Contact::MODULE_NAME,
                ];
            },
            $tagIds
        );

        try {
            TagEntity::insert($tagEntityData);
        } catch (Throwable $th) {
        }
    }

    public function getIdsWithAssociations(array $ids): array
    {
        if (empty($ids)) {
            return [];
        }

        $associatedDealsResult = Deal::whereIn('contact_id', $ids)
            ->select(['contact_id'])
            ->groupBy('contact_id')
            ->get();

        return empty($associatedDealsResult) ? [] : $associatedDealsResult->pluck('contact_id')->toArray();
    }

    public function getIdsByColumn(string $column, $value): array|bool
    {
        if (empty($column) || empty($value)) {
            return false;
        }

        $contacts = Contact::where($column, $value)->select(['id'])->get();

        if (empty($contacts)) {
            return false;
        }

        return $contacts->pluck('id')->toArray();
    }

    public function getIdsByColumnPaginated(string $column, $value, int $page, int $perPage): array
    {
        if (empty($column) || empty($value)) {
            return ['ids' => [], 'total' => 0];
        }

        $result = Contact::where($column, $value)->where('is_trash', 0)->select(['id'])->paginate($page, $perPage);
        $result['ids'] = $result['data']->pluck('id')->toArray();

        return $result;
    }

    public function getModel(): string
    {
        return Contact::class;
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
                    'module' => Contact::MODULE_NAME,
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

    private function buildOption($contact, array $columnSelect): array
    {
        $option = [
            'value' => $contact->id,
            'label' => trim($contact->first_name . ' ' . $contact->last_name),
        ];

        if (!empty($columnSelect)) {
            $data = [];
            foreach ($columnSelect as $column) {
                if (isset($contact->{$column})) {
                    $data[$column] = $contact->{$column};
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
            $keys = array_merge(['id'], ContactSystemDefinedFields::getAllFieldKeys());
        }

        return empty(array_diff($args, $keys));
    }
}
