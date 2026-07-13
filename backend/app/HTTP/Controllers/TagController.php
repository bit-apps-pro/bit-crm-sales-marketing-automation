<?php

namespace BitApps\Crm\HTTP\Controllers;

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPKit\Helpers\Slug;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Deps\BitApps\WPKit\Http\Response;
use BitApps\Crm\HTTP\Requests\Tag\DestroyRequest;
use BitApps\Crm\HTTP\Requests\Tag\EditRequest;
use BitApps\Crm\HTTP\Requests\Tag\IndexRequest;
use BitApps\Crm\HTTP\Requests\Tag\StoreRequest;
use BitApps\Crm\HTTP\Requests\Tag\TagsByModuleRequest;
use BitApps\Crm\HTTP\Requests\Tag\UpdatePinRequest;
use BitApps\Crm\HTTP\Requests\Tag\UpdateRequest;
use BitApps\Crm\Model\Tag;
use BitApps\Crm\Model\TagEntity;
use BitApps\Crm\Services\ModuleService;
use BitApps\Crm\Services\TagService;
use Throwable;

final class TagController
{
    private const DEFAULT_PER_PAGE = 20;

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
            return Response::error(__('Something went wrong! Failed to fetch tags!', 'bit-crm'));
        }

        return Response::success($tags);
    }

    public function store(StoreRequest $request)
    {
        if (!TagService::store($request->validated())) {
            return Response::error(__('Failed to create tag!', 'bit-crm'));
        }

        return Response::success(__('Tag created successfully', 'bit-crm'));
    }

    public function edit(EditRequest $request)
    {
        $validated = $request->validated();

        $tag = Tag::select(['id', 'title', 'module'])->findOne(['id' => $validated['id']]);

        if (!$tag) {
            return Response::error(__('Tag not found!', 'bit-crm'));
        }

        return Response::success($tag);
    }

    public function update(UpdateRequest $request)
    {
        $validated = $request->validated();

        $tag = Tag::findOne(['id' => $validated['id']]);

        if (!$tag) {
            return Response::error(__('Failed to update. Tag not found!', 'bit-crm'));
        }

        $validated['slug'] = Slug::generate($validated['title']);
        $validated['updated_by'] = get_current_user_id();

        if ($tag->update($validated)) {
            Hooks::doAction('bit_crm/tag_updated', $tag);

            return Response::success(__('Tag updated successfully', 'bit-crm'));
        }

        return Response::error(__('Failed to update tag!', 'bit-crm'));
    }

    public function updatePin(UpdatePinRequest $request)
    {
        $validated = $request->validated();

        $tag = Tag::findOne(['id' => $validated['id']]);

        if (!$tag) {
            return Response::error(__('Tag does not exist.', 'bit-crm'));
        }

        try {
            $tag->update(['is_pinned' => $validated['is_pinned']])->save();
        } catch (Throwable $th) {
            return Response::error(__('Failed to pin.', 'bit-crm'));
        }

        if ($validated['is_pinned'] === 1) {
            return Response::success(__('Tag pinned successfully', 'bit-crm'));
        }

        return Response::success(__('Tag unpinned successfully', 'bit-crm'));
    }

    public function destroy(DestroyRequest $request)
    {
        $validated = $request->validated();
        $tagsId = $validated['tagsId'];
        $tags = Tag::whereIn('id', $tagsId);

        if (!$tags->count()) {
            return Response::error(__('Tag not found!', 'bit-crm'));
        }

        try {
            $tags->delete();
        } catch (Throwable $th) {
            return Response::error(__('Failed to delete!', 'bit-crm'));
        }

        Hooks::doAction('bit_crm/tag_deleted', $tagsId);

        try {
            TagEntity::whereIn('tag_id', $tagsId)->delete();
        } catch (Throwable $th) {
            return Response::error(__('Failed to delete tag relations!', 'bit-crm'));
        }

        return Response::success(__('Tag deleted successfully', 'bit-crm'));
    }

    public function tagsByModule(TagsByModuleRequest $request)
    {
        $validatedData = $request->validated();

        $module = $validatedData['module'];

        if (!ModuleService::isValidModule($module)) {
            return Response::error(__('Invalid module', 'bit-crm'));
        }

        try {
            $tags = Tag::where('module', $module)->get();
        } catch (Throwable $th) {
            return Response::error(__('Something went wrong! Failed to fetch tags!', 'bit-crm'));
        }

        return Response::success($tags);
    }
}
