<?php

namespace BitApps\Crm\HTTP\Controllers;

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Deps\BitApps\WPKit\Http\Response;
use BitApps\Crm\Factories\EntityFactory;
use BitApps\Crm\HTTP\Requests\Activity\ActivityNotesRequest;
use BitApps\Crm\HTTP\Requests\Activity\DestroyRequest;
use BitApps\Crm\HTTP\Requests\Activity\EntitiesByModuleRequest;
use BitApps\Crm\HTTP\Requests\Activity\FieldsByModuleRequest;
use BitApps\Crm\HTTP\Requests\Activity\IndexRequest;
use BitApps\Crm\HTTP\Requests\Activity\ShowRequest;
use BitApps\Crm\HTTP\Requests\Activity\StoreRequest;
use BitApps\Crm\HTTP\Requests\Activity\UpcomingRequest;
use BitApps\Crm\HTTP\Requests\Activity\UpdateRequest;
use BitApps\Crm\HTTP\Requests\Activity\UpdateStatusRequest;
use BitApps\Crm\Model\Activity;
use BitApps\Crm\Model\Note;
use BitApps\Crm\Services\ActivityService;
use BitApps\Crm\src\UserPermissions\Roles;
use BitApps\Crm\Utils\Logger;
use Throwable;

final class ActivityController
{
    public const DEFAULT_PER_PAGE = 10;

    private const SUBMODULE = 'submodule';

    private ActivityService $activityService;

    public function __construct()
    {
        $this->activityService = new ActivityService();
    }

    public function index(IndexRequest $request)
    {
        $validated = $request->validated();
        $wpUsersTable = Config::get('WP_DB_PREFIX') . 'users';

        $notesTable = Config::withDBPrefix('notes');
        $noteCountSubquery = "(SELECT COUNT(id) FROM {$notesTable} WHERE entity_id = " . Config::withDBPrefix('activities') . ".id AND module = '" . Activity::MODULE_NAME . "') AS notes_count";

        $query = Activity::selectRaw("(SELECT display_name FROM {$wpUsersTable} WHERE ID = assigned_to) AS assignee, {$noteCountSubquery}")
            ->when(
                $validated['module'],
                function ($query) use ($validated) {
                    $query->where('module', $validated['module']);
                }
            )->when(
                $validated['entityId'],
                function ($query) use ($validated) {
                    $query->where('entity_id', $validated['entityId']);
                }
            )->when(
                !empty($validated['status']) && $validated['status'] === 'completed',
                function ($query) {
                    $query->where('is_completed', true);
                }
            )->when(
                !empty($validated['status']) && $validated['status'] === 'pending',
                function ($query) {
                    $query->where('is_completed', false);
                }
            )->when(
                !empty($validated['type']) && \in_array($validated['type'], Activity::TYPES),
                function ($query) use ($validated) {
                    $query->where('type', $validated['type']);
                }
            )->when(
                !empty($validated['priority']),
                function ($query) use ($validated) {
                    $query->where('priority', $validated['priority']);
                }
            )->when(
                !empty($validated['assigned_to']),
                function ($query) use ($validated) {
                    $query->where('assigned_to', $validated['assigned_to']);
                }
            )->when(
                $validated['search'],
                function ($query) use ($validated) {
                    $query->where(
                        function ($query) use ($validated) {
                            $query->where('title', 'LIKE', '%' . $validated['search'] . '%')
                                ->orWhere('details', 'LIKE', '%' . $validated['search'] . '%');
                        }
                    );
                }
            );

        $activities = $query->orderBy('created_at')->desc()
            ->paginate($validated['page'], $validated['perPage'] ?? self::DEFAULT_PER_PAGE);

        $activities['data'] = ActivityService::formatDataCollection($activities['data'], $validated['module'], $validated['entityId']);

        return Response::success($activities);
    }

    public function store(StoreRequest $request)
    {
        $result = $this->activityService->store($request);

        if (!$result['success']) {
            return Response::error($result['errors'][0]);
        }

        return Response::success($result['data']);
    }

    public function show(ShowRequest $request)
    {
        $result = $this->activityService->show($request);

        if (!$result['success']) {
            return Response::error($result['errors'][0]);
        }

        return Response::success($result['data']);
    }

    public function update(UpdateRequest $request)
    {
        $result = $this->activityService->update($request);

        if (!$result['success']) {
            return Response::error($result['errors'][0]);
        }

        return Response::success($result['data'])->message($result['message']);
    }

    public function updateStatus(UpdateStatusRequest $request)
    {
        $validated = $request->validated();

        $activity = Activity::findOne(['id' => $validated['id']]);

        if (empty($activity)) {
            return Response::error(__('Activity not found!', 'bit-crm-sales-marketing-automation'));
        }

        $oldStatus = $activity->is_completed ? 'completed' : 'pending';
        $activity->is_completed = !$activity->is_completed;
        $newStatus = $activity->is_completed ? 'completed' : 'pending';

        if ($activity->save()) {
            Hooks::doAction('bit_crm/activity_status_updated', $activity, $newStatus, $oldStatus);

            // translators: %s: activity type
            return Response::success($activity)->message(\sprintf(__('%s status updated successfully!', 'bit-crm-sales-marketing-automation'), ucfirst($activity->type)));
        }

        // translators: %s: activity type
        return Response::error(\sprintf(__('Failed to update %s status!', 'bit-crm-sales-marketing-automation'), ucfirst($activity->type)));
    }

    public function destroy(DestroyRequest $request)
    {
        $result = $this->activityService->destroy($request);

        if (!$result['success']) {
            return Response::error($result['errors'][0]);
        }

        return Response::success($result['data'])->message($result['message']);
    }

    public function wpUsersByRoles()
    {
        $users = get_users(
            [
                'role__in' => Roles::getRoleNames(true),
                'fields'   => ['ID', 'display_name', 'user_email']
            ]
        );

        return Response::success($users);
    }

    public function fieldsByModule(FieldsByModuleRequest $request)
    {
        $validated = $request->validated();

        try {
            $fields = EntityFactory::module($validated['module'])->fields();

            return Response::success($fields);
        } catch (Throwable $th) {
            Logger::error($th);

            return Response::error([])->message(__('Failed to fetch fields!', 'bit-crm-sales-marketing-automation'));
        }
    }

    public function entitiesByModule(EntitiesByModuleRequest $request)
    {
        // will handle differently later (has some prerequisites)

        $validated = $request->validated();

        try {
            $options = EntityFactory::module($validated['module'])->getEntitiesAsOptions();

            return Response::success($options)->message(__('Related field options retrieved successfully.', 'bit-crm-sales-marketing-automation'));
        } catch (Throwable $th) {
            Logger::error($th);

            return Response::error([])->message(__('Failed to retrieve related field options.', 'bit-crm-sales-marketing-automation'));
        }
    }

    public function activityNotes(ActivityNotesRequest $request)
    {
        $validated = $request->validated();

        if ($validated['module'] !== Activity::MODULE_NAME) {
            return Response::error([])->message(__('Invalid module for activity notes.', 'bit-crm-sales-marketing-automation'));
        }

        try {
            $notes = Note::where('entity_id', $validated['id'])->where('module', Activity::MODULE_NAME)->where('type', self::SUBMODULE)->desc()->get();

            return Response::success($notes);
        } catch (Throwable $th) {
            return Response::error([])->message(__('Failed to retrieve activity notes.', 'bit-crm-sales-marketing-automation'));
        }
    }

    public function upcoming(UpcomingRequest $request)
    {
        $validated = $request->validated();

        $limit = $validated['limit'] ?? 2;

        $activities = Activity::where('module', $validated['module'])
            ->where('entity_id', $validated['entityId'])
            ->where('is_completed', false)
            ->whereIn('type', [Activity::TYPES['TASK'], Activity::TYPES['MEETING'], Activity::TYPES['CALL']])
            ->where('due_date', '>=', gmdate('Y-m-d H:i:s'))
            ->orderBy('due_date')
            ->take($limit)
            ->get();

        $activities = ActivityService::formatDataCollection($activities, $validated['module'], $validated['entityId']);

        return Response::success($activities);
    }
}
