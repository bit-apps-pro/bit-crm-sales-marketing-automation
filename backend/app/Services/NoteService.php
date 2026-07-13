<?php

namespace BitApps\Crm\Services;

class NoteService
{
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
