<?php

namespace BitApps\Crm\HTTP\Controllers;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Response;
use BitApps\Crm\HTTP\Requests\GlobalSearch\SearchRequest;
use BitApps\Crm\Services\GlobalSearchService;
use BitApps\Crm\Utils\Logger;
use Throwable;

final class GlobalSearchController
{
    public function search(SearchRequest $request)
    {
        $validated = $request->validated();
        $scope = ($validated['scope'] ?? null) ?: GlobalSearchService::SCOPE_ALL;

        try {
            return Response::success((new GlobalSearchService())->search((string) $validated['term'], $scope));
        } catch (Throwable $th) {
            Logger::error($th);

            return Response::error(null)->message(__('Failed to search!', 'bit-crm-sales-marketing-automation'));
        }
    }
}
