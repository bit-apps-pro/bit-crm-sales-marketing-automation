<?php

namespace BitApps\Crm\HTTP\Controllers;

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPKit\Http\Response;
use BitApps\Crm\HTTP\Requests\Tag\DestroyRequest;
use BitApps\Crm\HTTP\Requests\Tag\EditRequest;
use BitApps\Crm\HTTP\Requests\Tag\IndexRequest;
use BitApps\Crm\HTTP\Requests\Tag\StoreRequest;
use BitApps\Crm\HTTP\Requests\Tag\TagsByModuleRequest;
use BitApps\Crm\HTTP\Requests\Tag\UpdateRequest;
use BitApps\Crm\Model\Tag;
use BitApps\Crm\Services\TagService;
use Throwable;

final class TagController
{
    private const DEFAULT_PER_PAGE = 20;

    private TagService $tagService;

    public function __construct()
    {
        $this->tagService = new TagService();
    }

    public function index(IndexRequest $request)
    {
        $validated = $request->validated();
        $modules = $validated['modules'] ?? null;
        $sortBy = !empty($validated['sortBy']) ? $validated['sortBy'] : 'id';
        $sortOrder = !empty($validated['sortOrder']) ? $validated['sortOrder'] : 'asc';

        $page = !empty($validated['page']) ? $validated['page'] : 1;
        $perPage = !empty($validated['perPage']) ? $validated['perPage'] : self::DEFAULT_PER_PAGE;
        $searchTerm = !empty($validated['searchTerm']) ? $validated['searchTerm'] : '';

        $tagEntityTable = Config::withDBPrefix('tag_entity');
        $tagsTable = Config::withDBPrefix('tags');
        $tagCountSubquery = "(SELECT COUNT(entity_id) FROM {$tagEntityTable} WHERE tag_id = {$tagsTable}.id) AS count";

        $tagsQuery = Tag::select(['id', 'title', 'module', $tagCountSubquery])->when(
            $modules,
            function ($tagsQuery) use ($modules) {
                $tagsQuery->whereIn('module', $modules);
            }
        )->when(
            !empty($searchTerm),
            function ($tagsQuery) use ($searchTerm) {
                $tagsQuery->where('title', 'LIKE', '%' . strtolower($searchTerm) . '%');
            }
        )->when(
            $sortOrder === 'asc',
            function ($tagsQuery) use ($sortBy) {
                $tagsQuery->orderBy($sortBy)->asc();
            },
            function ($tagsQuery) use ($sortBy) {
                $tagsQuery->orderBy($sortBy)->desc();
            }
        );

        try {
            $tags = $tagsQuery->paginate($page, $perPage);
        } catch (Throwable $th) {
            return Response::error(__('Something went wrong! Failed to fetch tags!', 'bit-crm-sales-marketing-automation'));
        }

        return Response::success($tags);
    }

    public function store(StoreRequest $request)
    {
        $result = $this->tagService->store($request);

        if (!$result['success']) {
            return Response::error($result['errors'][0]);
        }

        return Response::success($result['data'])->message($result['message']);
    }

    public function edit(EditRequest $request)
    {
        $result = $this->tagService->edit($request);

        if (!$result['success']) {
            return Response::error($result['errors'][0]);
        }

        return Response::success($result['data']);
    }

    public function update(UpdateRequest $request)
    {
        $result = $this->tagService->update($request);

        if (!$result['success']) {
            return Response::error($result['errors'][0]);
        }

        return Response::success($result['data'])->message($result['message']);
    }

    public function destroy(DestroyRequest $request)
    {
        $result = $this->tagService->destroy($request);

        if (!$result['success']) {
            return Response::error($result['errors'][0]);
        }

        return Response::success(null)->message($result['message']);
    }

    public function tagsByModule(TagsByModuleRequest $request)
    {
        $result = $this->tagService->tagsByModule($request);

        if (!$result['success']) {
            return Response::error($result['errors'][0]);
        }

        return Response::success($result['data']);
    }
}
