<?php

namespace BitApps\Crm\Services;

class LinkService
{
    public static function formatDataCollection($links, $module, $entityId)
    {
        if (empty($links) || empty($module) || empty($entityId)) {
            return $links;
        }

        $entityData = EntityFieldService::getEntityData($module, $entityId);

        if (empty($entityData)) {
            return $links;
        }

        return $links->map(
            function ($link) use ($entityData) {
                return self::formatData($link, $entityData);
            }
        );
    }

    private static function formatData($data, $entityData)
    {
        $formattedLink = EntityFieldService::renderFields($data->link, $entityData);
        $data->link = $formattedLink;
        $data->processed_url = esc_url($formattedLink);

        return $data;
    }
}
