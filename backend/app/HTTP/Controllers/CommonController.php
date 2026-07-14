<?php

namespace BitApps\Crm\HTTP\Controllers;

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPKit\Http\Response;
use BitApps\Crm\Factories\EntityFactory;
use BitApps\Crm\HTTP\Requests\CommonContr\EntityRelatedListsCountRequest;
use BitApps\Crm\HTTP\Requests\CommonContr\RelatedEntitiesDetachRequest;
use BitApps\Crm\HTTP\Requests\CommonContr\RelatedEntitiesRequest;
use BitApps\Crm\HTTP\Requests\CommonContr\RelatedEntitiesTableFieldsRequest;
use BitApps\Crm\HTTP\Requests\CommonContr\RelatedFieldOptionsRequest;
use BitApps\Crm\HTTP\Requests\CommonContr\RequiredFieldsRequest;
use BitApps\Crm\HTTP\Requests\CommonContr\SampleCsvRequest;
use BitApps\Crm\Model\Activity;
use BitApps\Crm\Model\Contact;
use BitApps\Crm\Model\Deal;
use BitApps\Crm\Services\CommonService;
use BitApps\Crm\Services\SettingService;
use BitApps\Crm\Utils\Logger;
use Throwable;

final class CommonController
{
    public const DEFAULT_PER_PAGE = 10;

    public function entityRelatedListsCount(EntityRelatedListsCountRequest $request)
    {
        $validated = $request->validated();
        $module = $validated['module'];
        $entityId = (int) $validated['entityId'];
        $activitiesTable = Config::withDBPrefix('activities');
        $attachmentsTable = Config::withDBPrefix('attachments');
        $notesTable = Config::withDBPrefix('notes');
        $linksTable = Config::withDBPrefix('links');

        $countsRaw = Activity::raw(
            "SELECT
                (SELECT COUNT(*) FROM (SELECT 1 FROM {$activitiesTable}  WHERE module = %s AND entity_id = %d AND type = %s LIMIT 100) t1) AS tasks,
                (SELECT COUNT(*) FROM (SELECT 1 FROM {$activitiesTable}  WHERE module = %s AND entity_id = %d AND type = %s LIMIT 100) t2) AS meetings,
                (SELECT COUNT(*) FROM (SELECT 1 FROM {$activitiesTable}  WHERE module = %s AND entity_id = %d AND type = %s LIMIT 100) t3) AS calls,
                (SELECT COUNT(*) FROM (SELECT 1 FROM {$attachmentsTable} WHERE module = %s AND entity_id = %d LIMIT 100) t4) AS attachments,
                (SELECT COUNT(*) FROM (SELECT 1 FROM {$notesTable}  WHERE module = %s AND entity_id = %d LIMIT 100) t5) AS notes,
                (SELECT COUNT(*) FROM (SELECT 1 FROM {$linksTable}  WHERE module = %s AND entity_id = %d LIMIT 100) t6) AS links",
            [
                $module, $entityId, Activity::TYPES['TASK'],
                $module, $entityId, Activity::TYPES['MEETING'],
                $module, $entityId, Activity::TYPES['CALL'],
                $module, $entityId,
                $module, $entityId,
                $module, $entityId,
            ]
        );

        $counts = (new CommonService())->formatCounts($countsRaw);

        return Response::success($counts)->message(__('Related entity counts retrieved successfully.', 'bit-crm'));
    }

    public function relatedFieldOptions(RelatedFieldOptionsRequest $request)
    {
        $validated = $request->validated();
        $pagination = false;

        if (!empty($validated['pageNo']) && !empty($validated['perPage'])) {
            $pagination = [
                'pageNo'  => $validated['pageNo'],
                'perPage' => $validated['perPage'],
            ];
        }

        try {
            $options = EntityFactory::module($validated['relatedModule'])->getEntitiesAsOptions($pagination, $validated['entityId'] ?? 0, $validated['searchTerm'] ?? null, $validated['args'] ?? []);
            $this->maybeIncludeSelectedOption($options, $validated['selectedValue'] ?? null, $validated['relatedModule']);

            return Response::success($options)->message(__('Related field options retrieved successfully.', 'bit-crm'));
        } catch (Throwable $th) {
            return Response::error([])->message(__('Failed to retrieve related field options.', 'bit-crm'));
        }
    }

    public function requiredFields(RequiredFieldsRequest $request)
    {
        $validated = $request->validated();

        try {
            $fields = EntityFactory::module($validated['module'])->fields();
            $requiredFields = (new CommonService())->filterRequiredFields($fields);

            return Response::success($requiredFields)
                ->message(__('Required fields retrieved successfully.', 'bit-crm'));
        } catch (Throwable $th) {
            return Response::error([])->message(__('Failed to retrieve required fields.', 'bit-crm'));
        }
    }

    public function sampleCsv(SampleCsvRequest $request)
    {
        $validated = $request->validated();
        $fileName = $validated['fileName'];

        $csvPath = '/resources/csv/' . $fileName . '.csv';
        $csvPathAbsolute = Config::get('BASEDIR') . $csvPath;

        if (!file_exists($csvPathAbsolute)) {
            return Response::error(__('Sample CSV file not found.', 'bit-crm'));
        }

        $csvUrl = plugins_url(Config::SLUG . '/backend/' . $csvPath);

        return Response::success(['download_url' => $csvUrl]);
    }

    public function relatedEntitiesTableConfig(RelatedEntitiesTableFieldsRequest $request)
    {
        $validated = $request->validated();
        $entity = $validated['entity'];
        $relatedEntity = $validated['relatedEntity'];

        $settingsKeys = CommonService::getRelatedEntityTableSettingsKeys($entity, $relatedEntity);

        if ($settingsKeys === null) {
            return Response::error(null)->message(__('Failed to retrieve table configuration for related entities.', 'bit-crm'));
        }

        $columnsOrder = SettingService::getSettingsValue($settingsKeys['columns_order']);
        $visibleColumns = SettingService::getSettingsValue($settingsKeys['visible_columns']);

        try {
            $fields = EntityFactory::module($relatedEntity)->fields();
        } catch (Throwable $th) {
            Logger::error($th);

            return Response::error(null)->message(__('Invalid related entity.', 'bit-crm'));
        }

        return Response::success(
            [
                'fields'          => $fields,
                'orders'          => $columnsOrder,
                'visible_columns' => $visibleColumns
            ]
        );
    }

    public function relatedEntities(RelatedEntitiesRequest $request)
    {
        $validated = $request->validated();
        $entity = $validated['entity'];
        $entityId = $validated['entityId'];
        $relatedEntity = $validated['relatedEntity'];
        $page = !empty($validated['page']) ? $validated['page'] : 1;
        $perPage = !empty($validated['perPage']) ? $validated['perPage'] : self::DEFAULT_PER_PAGE;
        $sortBy = !empty($validated['sortBy']) ? $validated['sortBy'] : 'id';
        $sortOrder = !empty($validated['sortOrder']) ? $validated['sortOrder'] : 'desc';

        $entityData = EntityFactory::module($entity)->findById($entityId);

        if (empty($entityData)) {
            return Response::error(__('Invalid ID', 'bit-crm'));
        }

        $foreignKey = CommonService::getEntityForeignKey($entity);

        if ($foreignKey === null) {
            return Response::error([])->message(__('Invalid entity', 'bit-crm'));
        }

        try {
            $paginatedResult = EntityFactory::module($relatedEntity)->getIdsByColumnPaginated($foreignKey, $entityId, $page, $perPage);
        } catch (Throwable $th) {
            // translators: 1. Related entity (e.g., Contact, Deal, etc.)
            return Response::error([])->message(\sprintf(__('Invalid related entity: %s', 'bit-crm'), $relatedEntity));
        }

        $relatedEntityIds = $paginatedResult['ids'];

        if (empty($relatedEntityIds)) {
            unset($paginatedResult['ids']);

            return Response::success($paginatedResult)->message(__('No related entities found', 'bit-crm'));
        }

        try {
            $data = EntityFactory::module($relatedEntity)->search(
                [
                    'page'      => 1,
                    'perPage'   => $perPage,
                    'offset'    => 0,
                    'sortBy'    => $sortBy,
                    'sortOrder' => $sortOrder,
                    'ids'       => $relatedEntityIds,
                ]
            );
        } catch (Throwable $th) {
            Logger::error($th);

            return Response::error(null)->message(__('Failed to retrieve related entities.', 'bit-crm'));
        }

        $data['total'] = $paginatedResult['total'];
        $data['current_page'] = $page;
        $data['last_page'] = $paginatedResult['last_page'];

        return Response::success($data);
    }

    public function detachRelatedEntity(RelatedEntitiesDetachRequest $request)
    {
        $validated = $request->validated();
        $entity = $validated['entity'];
        $entityId = $validated['entityId'];
        $relatedEntity = $validated['relatedEntity'];
        $relatedEntityIds = $validated['relatedEntityIds'];
        $updatedBy = get_current_user_id();

        if ($entity === Contact::MODULE_NAME && $relatedEntity === Deal::MODULE_NAME) {
            return Response::error(null)->message(__('Detaching Deals from a Contact is not allowed. Please edit the Deal to change the associated Contact.', 'bit-crm'));
        }

        $relatedEntityService = EntityFactory::module($relatedEntity);

        $foreignKey = CommonService::getEntityForeignKey($entity);

        try {
            $affectedRows = $relatedEntityService->getModel()::whereIn('id', $relatedEntityIds)
                ->where($foreignKey, $entityId)
                ->update([$foreignKey => null, 'updated_by' => $updatedBy]);
        } catch (Throwable $th) {
            Logger::error($th);

            return Response::error(null)->message(__('Failed to detach related entities.', 'bit-crm'));
        }

        if (!$affectedRows) {
            return Response::error(null)->message(__('Failed to detach related entities.', 'bit-crm'));
        }

        return Response::success(null)->message(__('Related entities detached successfully.', 'bit-crm'));
    }

    private function maybeIncludeSelectedOption(array &$options, int|string|null $selectedValue, string $relatedModule, array $columnSelect = [])
    {
        if (empty($selectedValue) || !\is_array($options) || !isset($options['data'], $options['current_page']) || (int) $options['current_page'] !== 1) {
            return;
        }

        $existingOptionValues = array_column($options['data'], 'value');

        if (\in_array($selectedValue, $existingOptionValues)) {
            return;
        }

        try {
            $selectedOption = EntityFactory::module($relatedModule)->getEntityAsOption($selectedValue, $columnSelect);

            // If the selected option is valid and not already in the options list, prepend it.
            if ($selectedOption && !\in_array($selectedOption['value'], $existingOptionValues)) {
                array_unshift($options['data'], $selectedOption);
            }
        } catch (Throwable $th) {
            return;
        }
    }
}
