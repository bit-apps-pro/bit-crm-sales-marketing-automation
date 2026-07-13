<?php

namespace BitApps\Crm\HTTP\Controllers;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Response;
use BitApps\Crm\HTTP\Requests\DealStage\ArchiveRequest;
use BitApps\Crm\HTTP\Requests\DealStage\UnarchiveRequest;
use BitApps\Crm\HTTP\Requests\DealStage\UpdateSortOrderRequest;
use BitApps\Crm\HTTP\Requests\DealStage\UpsertRequest;
use BitApps\Crm\Services\DealStageService;

final class DealStageController
{
    private DealStageService $dealStageService;

    public function __construct()
    {
        $this->dealStageService = new DealStageService();
    }

    public function index()
    {
        $stages = $this->dealStageService->getAllStages(DealStageService::STATUS_ACTIVE);
        $stages = array_values($stages);

        return Response::success($stages)->message(__('Deal stages retrieved successfully.', 'bit-crm'));
    }

    public function archived()
    {
        $stages = $this->dealStageService->getAllStages(DealStageService::STATUS_ARCHIVED);
        $stages = array_values($stages);

        return Response::success($stages)->message(__('Archived deal stages retrieved successfully.', 'bit-crm'));
    }

    public function store(UpsertRequest $request)
    {
        $validated = $request->validated();

        $stages = $this->dealStageService->getAllStages();

        if (\array_key_exists($validated['key'], $stages)) {
            return Response::error(null)->message(__('Stage with the given key already exists.', 'bit-crm'));
        }

        $stages[$validated['key']] = $validated;

        if ($this->dealStageService->upsertStages($stages)) {
            return Response::success(null)->message(__('Deal stage created successfully.', 'bit-crm'));
        }

        return Response::error(null)->message(__('Failed to create deal stage.', 'bit-crm'));
    }

    public function update(UpsertRequest $request)
    {
        $validated = $request->validated();
        $stages = $this->dealStageService->getAllStages();

        if (!\array_key_exists($validated['key'], $stages)) {
            return Response::error([])->message(__('Stage not found.', 'bit-crm'));
        }

        $stages[$validated['key']] = $validated;

        if ($this->dealStageService->upsertStages($stages)) {
            return Response::success([])->message(__('Deal stage updated successfully.', 'bit-crm'));
        }

        return Response::error([])->message(__('Failed to update deal stage.', 'bit-crm'));
    }

    public function archive(ArchiveRequest $request)
    {
        $validated = $request->validated();
        $stages = $this->dealStageService->getAllStages();

        if (!\array_key_exists($validated['key'], $stages)) {
            return Response::error([])->message(__('Stage not found.', 'bit-crm'));
        }

        $stage = $stages[$validated['key']];
        $keyIsArchived = DealStageService::KEY_IS_ARCHIVED;
        $stage[$keyIsArchived] = true;

        $stages[$validated['key']] = $stage;

        if ($this->dealStageService->upsertStages($stages)) {
            return Response::success([])->message(__('Deal stage archived successfully.', 'bit-crm'));
        }

        return Response::error([])->message(__('Failed to archive deal stage.', 'bit-crm'));
    }

    public function unarchive(UnarchiveRequest $request)
    {
        $validated = $request->validated();
        $stages = $this->dealStageService->getAllStages();
        $keyIsArchived = DealStageService::KEY_IS_ARCHIVED;

        foreach ($validated['keys'] as $key) {
            if (!\array_key_exists($key, $stages)) {
                continue;
            }

            $stage = $stages[$key];
            $stage[$keyIsArchived] = false;
            $stages[$key] = $stage;
        }

        if ($this->dealStageService->upsertStages($stages)) {
            return Response::success([])->message(__('Deal stages unarchived successfully.', 'bit-crm'));
        }

        return Response::error([])->message(__('Failed to unarchive deal stages.', 'bit-crm'));
    }

    public function updateSortOrder(UpdateSortOrderRequest $request)
    {
        $validated = $request->validated();
        $stages = $validated['stages'];
        $formattedStages = [];

        foreach ($stages as $stage) {
            $formattedStages[$stage['key']] = $stage;
        }

        $storedStages = $this->dealStageService->getAllStages();
        $formattedStages = array_merge($formattedStages, $storedStages);

        if ($this->dealStageService->upsertStages($formattedStages)) {
            return Response::success([])->message(__('Deal stages sort order updated successfully.', 'bit-crm'));
        }

        return Response::error([])->message(__('Failed to update deal stages sort order.', 'bit-crm'));
    }
}
