<?php

namespace BitApps\Crm\HTTP\Controllers;

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Deps\BitApps\WPKit\Http\Response;
use BitApps\Crm\HTTP\Requests\Link\DestroyRequest;
use BitApps\Crm\HTTP\Requests\Link\EditRequest;
use BitApps\Crm\HTTP\Requests\Link\IndexRequest;
use BitApps\Crm\HTTP\Requests\Link\StoreRequest;
use BitApps\Crm\HTTP\Requests\Link\UpdateRequest;
use BitApps\Crm\Model\Link;
use BitApps\Crm\Services\LinkService;

final class LinkController
{
    public const DEFAULT_PER_PAGE = 10;

    public function index(IndexRequest $request)
    {
        $validated = $request->validated();
        $wpUsersTable = Config::get('WP_DB_PREFIX') . 'users';

        $query = Link::selectRaw("(SELECT display_name FROM {$wpUsersTable} WHERE ID = created_by) AS created_by")
            ->where('module', $validated['module'])
            ->where('entity_id', $validated['entityId']);

        if (!empty($validated['search'])) {
            $query->where(
                function ($query) use ($validated) {
                    $query->where('title', 'LIKE', '%' . $validated['search'] . '%')
                        ->orWhere('description', 'LIKE', '%' . $validated['search'] . '%')
                        ->orWhere('link', 'LIKE', '%' . $validated['search'] . '%');
                }
            );
        }

        if ($validated['sortOrder'] === Link::SORT_RECENT_LAST) {
            $query->orderBy('created_at')->asc();
        } else {
            $query->orderBy('created_at')->desc();
        }

        $links = $query->paginate($validated['page'], $validated['perPage'] ?? self::DEFAULT_PER_PAGE);

        $links['data'] = LinkService::formatDataCollection($links['data'], $validated['module'], $validated['entityId']);

        return Response::success($links);
    }

    public function store(StoreRequest $request)
    {
        $validated = $request->validated();
        $validated['created_by'] = get_current_user_id();

        if ($link = Link::insert($validated)) {
            Hooks::doAction('bit_crm/link_created', $link);

            return Response::success(__('Link created successfully!', 'bit-crm-sales-marketing-automation'));
        }

        return Response::error(__('Failed to create link!', 'bit-crm-sales-marketing-automation'));
    }

    public function edit(EditRequest $request)
    {
        $validated = $request->validated();
        $link = Link::findOne(['id' => $validated['id']]);

        if (empty($link)) {
            return Response::error(__('Link not found!', 'bit-crm-sales-marketing-automation'));
        }

        return Response::success($link);
    }

    public function update(UpdateRequest $request)
    {
        $validated = $request->validated();
        $link = Link::findOne(['id' => $validated['id']]);

        if (empty($link)) {
            return Response::error(__('Link not found!', 'bit-crm-sales-marketing-automation'));
        }

        $validated['updated_by'] = get_current_user_id();

        if ($link->update($validated)) {
            Hooks::doAction('bit_crm/link_updated', $link);

            return Response::success($link);
        }

        return Response::error(__('Failed to update link!', 'bit-crm-sales-marketing-automation'));
    }

    public function destroy(DestroyRequest $request)
    {
        $validated = $request->validated();
        $link = new Link($validated['id']);

        if (!$link->exists()) {
            return Response::error(__('Link not found!', 'bit-crm-sales-marketing-automation'));
        }

        if ($link->delete()) {
            Hooks::doAction('bit_crm/link_deleted', $validated['id']);

            return Response::success(__('Link deleted successfully!', 'bit-crm-sales-marketing-automation'));
        }

        return Response::error(__('Failed to delete link!', 'bit-crm-sales-marketing-automation'));
    }
}
