<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Constants\HookKeys;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Factories\EntityFactory;
use BitApps\Crm\HTTP\Requests\Activity\DestroyRequest;
use BitApps\Crm\HTTP\Requests\Activity\ShowRequest;
use BitApps\Crm\HTTP\Requests\Activity\StoreRequest;
use BitApps\Crm\HTTP\Requests\Activity\UpdateRequest;
use BitApps\Crm\Model\Activity;
use BitApps\Crm\Utils\Logger;
use Throwable;

class ActivityService
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

        if (!empty($validated['is_shared'])) {
            $error = Hooks::applyFilter(HookKeys::VALIDATE_SHARED_ACTIVITY, null, (int) $validated['entity_id'], $validated['type']);

            if ($error) {
                return $error;
            }
        }

        if ($storedActivity = Activity::insert($validated)) {
            Hooks::doAction('bit_crm/activity_created', $storedActivity);

            // translators: %s: activity type
            return ['success' => true, 'data' => \sprintf(__('%s created successfully!', 'bit-crm-sales-marketing-automation'), ucfirst($validated['type']))];
        }

        // translators: %s: activity type
        return ['success' => false, 'errors' => [\sprintf(__('Failed to create %s!', 'bit-crm-sales-marketing-automation'), $validated['type'])]];
    }

    public function show(array|Request $data): array
    {
        $validated = CommonService::resolveValidatedData($data, (new ShowRequest())->rules());

        if (isset($validated['errors'])) {
            return $validated;
        }

        $activity = Activity::findOne(['id' => $validated['id']]);

        if (empty($activity)) {
            return ['success' => false, 'errors' => [__('Activity not found!', 'bit-crm-sales-marketing-automation')]];
        }

        return ['success' => true, 'data' => $activity];
    }

    public function update(array|Request $data): array
    {
        $validated = CommonService::resolveValidatedData($data, (new UpdateRequest())->rules());

        if (isset($validated['errors'])) {
            return $validated;
        }

        $activity = Activity::findOne(['id' => $validated['id']]);

        if (empty($activity)) {
            // translators: %s: activity type
            return ['success' => false, 'errors' => [\sprintf(__('%s not found!', 'bit-crm-sales-marketing-automation'), ucfirst($validated['type']))]];
        }

        // An activity's owning entity is fixed at creation; never reassign it on update.
        unset($validated['entity_id']);

        if (!empty($validated['is_shared'])) {
            $error = Hooks::applyFilter(HookKeys::VALIDATE_SHARED_ACTIVITY, null, (int) $activity->entity_id, $validated['type']);

            if ($error) {
                return $error;
            }
        }

        $validated['updated_by'] = get_current_user_id();

        if (empty($validated['attachments'])) {
            $validated['attachments'] = null;
        }

        if ($activity->update($validated)) {
            Hooks::doAction('bit_crm/activity_updated', $activity);

            // translators: %s: activity type
            return ['success' => true, 'data' => $activity, 'message' => \sprintf(__('%s updated successfully!', 'bit-crm-sales-marketing-automation'), ucfirst($validated['type']))];
        }

        // translators: %s: activity type
        return ['success' => false, 'errors' => [\sprintf(__('Failed to update %s!', 'bit-crm-sales-marketing-automation'), $validated['type'])]];
    }

    public function destroy(array|Request $data): array
    {
        $rules = (new DestroyRequest())->rules();
        $validated = CommonService::resolveValidatedData($data, $rules);

        if (isset($validated['errors'])) {
            return $validated;
        }

        $activity = Activity::findOne(['id' => $validated['id']]);

        if (empty($activity)) {
            return ['success' => false, 'errors' => [__('Activity not found!', 'bit-crm-sales-marketing-automation')]];
        }

        $type = $activity->type;

        if ($activity->delete()) {
            Hooks::doAction('bit_crm/activity_deleted', $validated['id']);

            // translators: %s: activity type
            return ['success' => true, 'data' => null, 'message' => \sprintf(__('%s deleted successfully!', 'bit-crm-sales-marketing-automation'), ucfirst($type))];
        }

        // translators: %s: activity type
        return ['success' => false, 'errors' => [\sprintf(__('Failed to delete %s!', 'bit-crm-sales-marketing-automation'), $type)]];
    }

    public static function formatDataCollection($activities, $module, $entityId)
    {
        if (empty($activities)) {
            return $activities;
        }

        $entityData = [];

        if (!empty($module) && !empty($entityId)) {
            $entityData = EntityFieldService::getEntityData($module, $entityId);
        }

        return $activities->map(
            function ($activity) use ($entityData) {
                return self::formatData($activity, $entityData);
            }
        );
    }

    private static function formatData($data, $entityData)
    {
        if (empty($entityData)) {
            $entityData = EntityFieldService::getEntityData($data->module, $data->entity_id);
        }

        $data->title = EntityFieldService::renderFields($data->title, $entityData);
        $data->details = EntityFieldService::renderFields($data->details, $entityData);
        $data->entity_name = self::getFullName($data->module, $entityData);

        return $data;
    }

    private static function getFullName(string $module, array|false $data): string
    {
        if (empty($module) || empty($data)) {
            return '';
        }

        try {
            return EntityFactory::module($module)->getDisplayName($data);
        } catch (Throwable $th) {
            Logger::error($th);

            return '';
        }
    }
}
