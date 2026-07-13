<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Constants\HookKeys;
use BitApps\Crm\Deps\BitApps\WPDatabase\Connection;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use Throwable;

class TrashService
{
    public static function restoreTrashes($trashes)
    {
        $groupedByModule = self::groupEntityIdsByModule($trashes);

        foreach ($groupedByModule as $module => $entityIds) {
            if ($model = ModuleService::getModelInstanceByModule($module)) {
                $model::whereIn('id', $entityIds)->update(['is_trash' => false]);
            }
        }
    }

    public static function deleteTrashes($trashes)
    {
        $groupedByModule = self::groupEntityIdsByModule($trashes);

        foreach ($groupedByModule as $module => $entityIds) {
            if ($model = ModuleService::getModelInstanceByModule($module)) {
                self::deleteEntitiesWithRelations($model, $entityIds);
            }
        }
    }

    public static function deleteEntitiesWithRelations($entityModel, $entityIds)
    {
        if (!\is_array($entityIds) && !empty($entityIds)) {
            return false;
        }

        Connection::startTransaction();

        try {
            $entityModel::whereIn('id', $entityIds)->delete();

            $relatedModels = Hooks::applyFilter(HookKeys::ENTITY_RELATED_MODELS, $entityModel::RELATED_MODELS);
            foreach ($relatedModels as $relatedModel) {
                $query = $relatedModel::where('module', $entityModel::MODULE_NAME)->whereIn('entity_id', $entityIds);

                if ($query->count()) {
                    $query->delete();
                }
            }

            Connection::commit();

            return true;
        } catch (Throwable $th) {
            Connection::rollback();

            return false;
        }
    }

    public static function groupEntityIdsByModule(array $trashes)
    {
        $entityIdsByModule = [];
        foreach ($trashes as $trash) {
            $entityIdsByModule[$trash['module']][] = (int) $trash['entity_id'];
        }

        return $entityIdsByModule;
    }
}
