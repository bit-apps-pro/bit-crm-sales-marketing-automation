<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Constants\HookKeys;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\HTTP\Requests\Note\StoreRequest;
use BitApps\Crm\Model\Note;

class NoteService
{
    public function store(array|Request $data): array
    {
        $validated = CommonService::resolveValidatedData($data, (new StoreRequest())->rules());

        if (isset($validated['errors'])) {
            return $validated;
        }

        $isShared = $validated['is_shared'] ?? false;
        $validated['created_by'] = get_current_user_id();

        if (empty($validated['attachments'])) {
            unset($validated['attachments']);
        }

        if ($isShared) {
            $error = Hooks::applyFilter(HookKeys::VALIDATE_SHARED_NOTE, null, (int) $validated['entity_id']);

            if ($error) {
                return $error;
            }
        }

        if ($note = Note::insert($validated)) {
            Hooks::doAction('bit_crm/note_created', $note);

            return ['success' => true, 'data' => $note];
        }

        return ['success' => false, 'errors' => [__('Failed to create note!', 'bit-crm-sales-marketing-automation')]];
    }

    public static function formatDataCollection($notes, $module, $entityId)
    {
        if (empty($notes)) {
            return $notes;
        }

        $entityData = [];

        if (!empty($module) && !empty($entityId)) {
            $entityData = EntityFieldService::getEntityData($module, $entityId);
        }

        return $notes->map(
            function ($note) use ($entityData) {
                return self::formatData($note, $entityData);
            }
        );
    }

    public static function formatData($data, $entityData = [])
    {
        if (empty($data)) {
            return $data;
        }

        if (empty($entityData) && !empty($data->module) && !empty($data->entity_id)) {
            $entityData = EntityFieldService::getEntityData($data->module, $data->entity_id);
        }

        $data->title = EntityFieldService::renderFields($data->title, $entityData);
        $data->details = EntityFieldService::renderFieldsInHtml($data->details, $entityData);

        return $data;
    }
}
