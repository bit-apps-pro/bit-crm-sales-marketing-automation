<?php

namespace BitApps\Crm\HTTP\Controllers;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Response;
use BitApps\Crm\HTTP\Requests\ExternalApi\DestroyKeyRequest;
use BitApps\Crm\HTTP\Requests\ExternalApi\IndexRequest;
use BitApps\Crm\HTTP\Requests\ExternalApi\StoreKeyRequest;
use BitApps\Crm\HTTP\Requests\ExternalApi\UpdateSettingsRequest;
use BitApps\Crm\Services\ExternalApiKeyService;

if (!defined('ABSPATH')) {
    exit;
}

final class ExternalApiController
{
    public const DEFAULT_PER_PAGE = 10;

    private $externalApiKeyService;

    public function __construct()
    {
        $this->externalApiKeyService = new ExternalApiKeyService();
    }

    /**
     * Settings, plus one page of eligible users with the keys each holds.
     *
     * The user picker is not served from here -- it uses the shared lookup
     * options endpoint with the plugin's role filter, like every other user
     * picker in the plugin.
     */
    public function index(IndexRequest $request)
    {
        $validated = $request->validated();

        return Response::success(
            [
                'settings' => $this->externalApiKeyService->settings(),
                'users'    => $this->externalApiKeyService->usersWithKeys(
                    empty($validated['page']) ? 1 : (int) $validated['page'],
                    empty($validated['perPage']) ? self::DEFAULT_PER_PAGE : (int) $validated['perPage']
                ),
            ]
        );
    }

    public function updateSettings(UpdateSettingsRequest $request)
    {
        $validated = $request->validated();

        $this->externalApiKeyService->updateEnabled((bool) $validated['enabled']);

        return Response::success($this->externalApiKeyService->settings())
            ->message(__('Settings updated successfully.', 'bit-crm-sales-marketing-automation'));
    }

    /**
     * Issues a key. The response carries the only copy of the plaintext
     * password, so the UI must show it before the modal closes.
     */
    public function storeKey(StoreKeyRequest $request)
    {
        $validated = $request->validated();
        $userId = (int) $validated['userId'];

        if (!$this->externalApiKeyService->settings()['available']) {
            return Response::error(null)->message(
                __(
                    'Application Passwords are unavailable. They require HTTPS, or a local environment type.',
                    'bit-crm-sales-marketing-automation'
                )
            );
        }

        /*
         * Core's create_new_application_password() performs no capability check
         * of its own, so without this any CRM user could mint a credential for
         * any other user.
         */
        if (!current_user_can('edit_user', $userId)) {
            return Response::error(null)->message(
                __('You are not allowed to create a key for this user.', 'bit-crm-sales-marketing-automation')
            );
        }

        $created = $this->externalApiKeyService->create($userId, $validated['name']);

        if (is_wp_error($created)) {
            return Response::error(null)->message($created->get_error_message());
        }

        return Response::success($created)
            ->message(__('API key created successfully.', 'bit-crm-sales-marketing-automation'));
    }

    public function destroyKey(DestroyKeyRequest $request)
    {
        $validated = $request->validated();
        $userId = (int) $validated['userId'];

        if (!current_user_can('edit_user', $userId)) {
            return Response::error(null)->message(
                __('You are not allowed to revoke keys for this user.', 'bit-crm-sales-marketing-automation')
            );
        }

        if (!$this->externalApiKeyService->delete($userId, $validated['uuid'])) {
            return Response::error(null)->message(
                __('Failed to revoke the API key!', 'bit-crm-sales-marketing-automation')
            );
        }

        return Response::success(['uuid' => $validated['uuid']])
            ->message(__('API key revoked successfully.', 'bit-crm-sales-marketing-automation'));
    }
}
