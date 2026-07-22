<?php

namespace BitApps\Crm\Services;

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

        $validated['created_by'] = get_current_user_id();

        if (empty($validated['attachments'])) {
            unset($validated['attachments']);
        }

        if ($note = Note::insert($validated)) {
            Hooks::doAction('bit_crm/note_created', $note);

            return ['success' => true, 'data' => $note];
        }

        return ['success' => false, 'errors' => [__('Failed to create note!', 'bit-crm-sales-marketing-automation')]];
    }

    public static function formatDataCollection($notes, $module, $entityId)
    {
        if (empty($notes) || empty($module) || empty($entityId)) {
            return $notes;
        }

        $entityData = EntityFieldService::getEntityData($module, $entityId);

        if (empty($entityData)) {
            return $notes;
        }

        return $notes->map(
            function ($note) use ($entityData) {
                return self::formatData($note, $entityData);
            }
        );
    }

    private static function formatData($data, $entityData)
    {
        $data->title = EntityFieldService::renderFields($data->title, $entityData);
        $data->details = EntityFieldService::renderFieldsInHtml($data->details, $entityData);

        return $data;
    }
}
