<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Deps\BitApps\WPDatabase\Connection;
use BitApps\Crm\Deps\BitApps\WPKit\Helpers\Slug;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\HTTP\Requests\Tag\DestroyRequest;
use BitApps\Crm\HTTP\Requests\Tag\EditRequest;
use BitApps\Crm\HTTP\Requests\Tag\StoreRequest;
use BitApps\Crm\HTTP\Requests\Tag\TagsByModuleRequest;
use BitApps\Crm\HTTP\Requests\Tag\UpdateRequest;
use BitApps\Crm\Model\Tag;
use BitApps\Crm\Model\TagEntity;
use Throwable;

class TagService
{
    public function store(array|Request $data): array
    {
        $rules = (new StoreRequest())->rules();
        $validated = CommonService::resolveValidatedData($data, $rules);

        if (isset($validated['errors'])) {
            return $validated;
        }

        if (!ModuleService::isValidModule($validated['module'])) {
            return ['success' => false, 'errors' => [__('Invalid module specified', 'bit-crm-sales-marketing-automation')]];
        }

        $validated['slug'] = Slug::generate($validated['title']);
        $validated['created_by'] = get_current_user_id();

        try {
            $tag = Tag::insert($validated);
        } catch (Throwable $th) {
            return ['success' => false, 'errors' => [__('Failed to create tag!', 'bit-crm-sales-marketing-automation')]];
        }

        if (!$tag) {
            return ['success' => false, 'errors' => [__('Failed to create tag!', 'bit-crm-sales-marketing-automation')]];
        }

        Hooks::doAction('bit_crm/tag_created', $tag);

        return ['success' => true, 'data' => $tag, 'message' => __('Tag created successfully', 'bit-crm-sales-marketing-automation')];
    }

    public function edit(array|Request $data): array
    {
        $rules = (new EditRequest())->rules();
        $validated = CommonService::resolveValidatedData($data, $rules);

        if (isset($validated['errors'])) {
            return $validated;
        }

        $tag = Tag::select(['id', 'title', 'module'])->findOne(['id' => $validated['id']]);

        if (!$tag) {
            return ['success' => false, 'errors' => [__('Tag not found!', 'bit-crm-sales-marketing-automation')]];
        }

        return ['success' => true, 'data' => $tag];
    }

    public function update(array|Request $data): array
    {
        $rules = (new UpdateRequest())->rules();
        $validated = CommonService::resolveValidatedData($data, $rules);

        if (isset($validated['errors'])) {
            return $validated;
        }

        $tag = Tag::findOne(['id' => $validated['id']]);

        if (!$tag) {
            return ['success' => false, 'errors' => [__('Failed to update. Tag not found!', 'bit-crm-sales-marketing-automation')]];
        }

        $validated['slug'] = Slug::generate($validated['title']);
        $validated['updated_by'] = get_current_user_id();

        try {
            if (!$tag->update($validated)) {
                return ['success' => false, 'errors' => [__('Failed to update tag!', 'bit-crm-sales-marketing-automation')]];
            }
        } catch (Throwable $th) {
            return ['success' => false, 'errors' => [__('Failed to update tag!', 'bit-crm-sales-marketing-automation')]];
        }

        Hooks::doAction('bit_crm/tag_updated', $tag);

        return ['success' => true, 'data' => $tag, 'message' => __('Tag updated successfully', 'bit-crm-sales-marketing-automation')];
    }

    public function destroy(array|Request $data): array
    {
        $rules = (new DestroyRequest())->rules();
        $validated = CommonService::resolveValidatedData($data, $rules);

        if (isset($validated['errors'])) {
            return $validated;
        }

        $tagsId = $validated['tagsId'];
        $tags = Tag::whereIn('id', $tagsId);

        if (!$tags->count()) {
            return ['success' => false, 'errors' => [__('Tag not found!', 'bit-crm-sales-marketing-automation')]];
        }

        Connection::startTransaction();

        try {
            $tags->delete();
            TagEntity::whereIn('tag_id', $tagsId)->delete();

            Connection::commit();
        } catch (Throwable $th) {
            Connection::rollback();

            return ['success' => false, 'errors' => [__('Failed to delete!', 'bit-crm-sales-marketing-automation')]];
        }

        Hooks::doAction('bit_crm/tag_deleted', $tagsId);

        return ['success' => true, 'message' => __('Tag deleted successfully', 'bit-crm-sales-marketing-automation')];
    }

    public function tagsByModule(array|Request $data): array
    {
        $rules = (new TagsByModuleRequest())->rules();
        $validated = CommonService::resolveValidatedData($data, $rules);

        if (isset($validated['errors'])) {
            return $validated;
        }

        $module = $validated['module'];

        if (!ModuleService::isValidModule($module)) {
            return ['success' => false, 'errors' => [__('Invalid module', 'bit-crm-sales-marketing-automation')]];
        }

        try {
            $tags = Tag::where('module', $module)->get();
        } catch (Throwable $th) {
            return ['success' => false, 'errors' => [__('Something went wrong! Failed to fetch tags!', 'bit-crm-sales-marketing-automation')]];
        }

        return ['success' => true, 'data' => $tags];
    }
}
