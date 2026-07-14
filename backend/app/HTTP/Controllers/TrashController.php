<?php

namespace BitApps\Crm\HTTP\Controllers;

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPDatabase\Connection;
use BitApps\Crm\Deps\BitApps\WPKit\Http\Response;
use BitApps\Crm\Helpers\SQLHelper;
use BitApps\Crm\HTTP\Requests\Trash\DestroyRequest;
use BitApps\Crm\HTTP\Requests\Trash\EmptyRequest;
use BitApps\Crm\HTTP\Requests\Trash\IndexRequest;
use BitApps\Crm\HTTP\Requests\Trash\RestoreRequest;
use BitApps\Crm\Model\Trash;
use BitApps\Crm\Services\TrashService;
use BitApps\Crm\src\Queue\TrashDeleteProcess;
use Throwable;

final class TrashController
{
    private const DEFAULT_PER_PAGE = 10;

    public function index(IndexRequest $request)
    {
        $validated = $request->validated();

        $page = $validated['page'] ?? 1;
        $perPage = $validated['perPage'] ?? self::DEFAULT_PER_PAGE;
        $sortBy = $validated['sortBy'] ?? 'created_at';
        $sortOrder = $validated['sortOrder'] ?? 'desc';
        $module = $validated['module'] ?? null;
        $dateRangeRaw = $validated['dateRange'] ?? null;
        $dateRange = $dateRangeRaw ? explode(',', $dateRangeRaw) : [];
        $startDate = $dateRange[0] ?? null;
        $endDate = $dateRange[1] ?? null;
        $wpUsersTable = Config::get('WP_DB_PREFIX') . 'users';

        $trashQuery = Trash::selectRaw("(SELECT u.display_name FROM {$wpUsersTable} u WHERE u.ID = created_by ) AS created_by_name")
            ->when(
                $module,
                function ($query) use ($module) {
                    return $query->where('module', $module);
                }
            )
            ->when(
                $startDate && $endDate,
                function ($query) use ($startDate, $endDate) {
                    return $query->whereRaw(SQLHelper::utcToSiteDate('created_at') . ' BETWEEN %s AND %s', [$startDate, $endDate]);
                }
            )
            ->orderBy($sortBy)
            ->when(
                $sortOrder === 'desc',
                function ($query) {
                    return $query->desc();
                },
                function ($query) {
                    return $query->asc();
                }
            );

        try {
            $trashes = $trashQuery->paginate($page, $perPage);
        } catch (Throwable $th) {
            return Response::error(__('Failed to fetch trashes!', 'bit-crm-sales-marketing-automation'));
        }

        return Response::success($trashes);
    }

    public function restore(RestoreRequest $request)
    {
        $validated = $request->validated();

        $trashQuery = Trash::select(['entity_id', 'module'])->whereIn('id', $validated['ids']);

        $trashes = $trashQuery->get()->toArray();

        Connection::startTransaction();

        try {
            TrashService::restoreTrashes($trashes);
            $trashQuery->delete();

            Connection::commit();
        } catch (Throwable $th) {
            Connection::rollback();

            return Response::error(__('Failed to restore trashes!', 'bit-crm-sales-marketing-automation'));
        }

        return Response::success(__('Trash restored successfully', 'bit-crm-sales-marketing-automation'));
    }

    public function destroy(DestroyRequest $request)
    {
        $validated = $request->validated();
        $trashIds = $validated['ids'] ?? [];

        $trashes = Trash::select(['entity_id', 'module'])
            ->whereIn('id', $trashIds)
            ->get()
            ->toArray();

        try {
            TrashService::deleteTrashes($trashes);
        } catch (Throwable $th) {
            return Response::error(__('Could not delete trash', 'bit-crm-sales-marketing-automation'));
        }

        return Response::success(__('Trash deleted successfully', 'bit-crm-sales-marketing-automation'));
    }

    public function empty(EmptyRequest $request)
    {
        $request->validated();

        $isEmptyTrashQueueProcessExist = Config::getOption(Trash::IS_QUEUE_IN_PROCESS_KEY, false);

        if ($isEmptyTrashQueueProcessExist) {
            return Response::error(__('Trash already scheduled for deletion successfully', 'bit-crm-sales-marketing-automation'));
        }

        $trashTable = Config::withDBPrefix('trashes');
        $trashQuery = Trash::raw("SELECT EXISTS(SELECT 1 FROM {$trashTable} LIMIT 1) as trash_exists");

        if ($trashQuery[0]->trash_exists < 1) {
            return Response::error(__('Trash is already empty.', 'bit-crm-sales-marketing-automation'));
        }

        Config::addOption(Trash::IS_QUEUE_IN_PROCESS_KEY, true);

        (new TrashDeleteProcess())
            ->push_to_queue([])
            ->save()
            ->dispatch();

        return Response::success(__('Trash scheduled for deletion successfully', 'bit-crm-sales-marketing-automation'));
    }
}
