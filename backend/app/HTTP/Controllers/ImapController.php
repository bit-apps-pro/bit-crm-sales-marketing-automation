<?php

namespace BitApps\Crm\HTTP\Controllers;

use BitApps\Crm\Config;
use BitApps\Crm\Constants\CommonConstant;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Deps\BitApps\WPKit\Http\Response;
use BitApps\Crm\Helpers\Hash;
use BitApps\Crm\HTTP\Requests\Imap\DestroyRequest;
use BitApps\Crm\HTTP\Requests\Imap\EditRequest;
use BitApps\Crm\HTTP\Requests\Imap\FetchEmailRequest;
use BitApps\Crm\HTTP\Requests\Imap\IndexRequest;
use BitApps\Crm\HTTP\Requests\Imap\StoreRequest;
use BitApps\Crm\HTTP\Requests\Imap\UpdateRequest;
use BitApps\Crm\HTTP\Requests\Imap\UpdateStatusRequest;
use BitApps\Crm\Model\ImapSetting;
use BitApps\Crm\Services\ImapService;
use BitApps\Crm\src\Capability;
use BitApps\Crm\src\Queue\FetchImapEmailsProcess;
use Throwable;

final class ImapController
{
    private const DEFAULT_PER_PAGE = 12;

    public function index(IndexRequest $request)
    {
        $validated = $request->validated();
        $page = $validated['page'];
        $currentUserId = get_current_user_id();

        try {
            $imapSettings = ImapSetting::where('created_by', $currentUserId)
                ->orWhere(
                    function ($query) {
                        $query->where('visibility', ImapSetting::VISIBILITY_PUBLIC)->where('status', true);
                    }
                )
                ->select(['id', 'title', 'platform', 'username', 'visibility', 'status'])
                ->selectRaw('IF(created_by = %d , TRUE, FALSE) AS can_update', [$currentUserId])
                ->orderByRaw('CASE WHEN created_by = %d THEN 0 ELSE 1 END, created_by ASC', [$currentUserId])
                ->orderBy('created_at')->desc()
                ->paginate($page, self::DEFAULT_PER_PAGE);
        } catch (Throwable $th) {
            return Response::error(__('Something went wrong! Failed to fetch imap settings!', 'bit-crm-sales-marketing-automation'));
        }

        return Response::success($imapSettings);
    }

    public function store(StoreRequest $request)
    {
        $validated = $request->validated();
        $platform = $validated['platform'];

        if ($platform !== 'other') {
            $commonConfig = ImapService::getCommonImapConfigByPlatform($platform);

            if (empty($commonConfig)) {
                return Response::error(__('Failed to save IMAP settings, invalid platform!', 'bit-crm-sales-marketing-automation'));
            }

            $validated = array_merge($validated, $commonConfig);
        }

        if (ImapService::isExists($validated['username'], $validated['host'])) {
            return Response::error(__('IMAP settings already exists!', 'bit-crm-sales-marketing-automation'));
        }

        $validated['visibility'] = $validated['is_private'] === 'yes' ? ImapSetting::VISIBILITY_PRIVATE : ImapSetting::VISIBILITY_PUBLIC;
        $validated['app_password'] = Hash::encrypt($validated['app_password']);
        $validated['created_by'] = get_current_user_id();

        if ($imapSetting = ImapSetting::insert($validated)) {
            Hooks::doAction('bit_crm/imap_configuration_created', $imapSetting);

            return Response::success(__('Imap settings saved successfully', 'bit-crm-sales-marketing-automation'));
        }

        return Response::error(__('Failed to save imap settings!', 'bit-crm-sales-marketing-automation'));
    }

    public function edit(EditRequest $request)
    {
        $validated = $request->validated();
        $imapSetting = ImapSetting::findOne(['id' => $validated['id']]);

        if (!$imapSetting) {
            return Response::error(__('Imap settings not found!', 'bit-crm-sales-marketing-automation'));
        }

        if (
            $imapSetting->visibility === ImapSetting::VISIBILITY_PRIVATE
            && (int) $imapSetting->created_by !== get_current_user_id()
        ) {
            return Response::error(__('Imap settings not found!', 'bit-crm-sales-marketing-automation'));
        }

        $imapSetting->app_password = Hash::decrypt($imapSetting->app_password);
        $imapSetting->is_private = $imapSetting->visibility === ImapSetting::VISIBILITY_PRIVATE ? 'yes' : 'no';

        return Response::success($imapSetting);
    }

    public function update(UpdateRequest $request)
    {
        $validated = $request->validated();

        if (ImapService::isExists($validated['username'], $validated['host'], $validated['id'])) {
            return Response::error(__('Username (email) taken by another settings!', 'bit-crm-sales-marketing-automation'));
        }

        $platform = $validated['platform'];

        if ($platform !== 'other') {
            $commonConfig = ImapService::getCommonImapConfigByPlatform($platform);

            if (empty($commonConfig)) {
                return Response::error(__('Failed to save IMAP settings, invalid platform!', 'bit-crm-sales-marketing-automation'));
            }

            $validated = array_merge($validated, $commonConfig);
        }

        $validated['visibility'] = $validated['is_private'] === 'yes' ? ImapSetting::VISIBILITY_PRIVATE : ImapSetting::VISIBILITY_PUBLIC;
        $validated['app_password'] = Hash::encrypt($validated['app_password']);
        $validated['updated_by'] = get_current_user_id();

        $imapSetting = ImapSetting::findOne(['id' => $validated['id']]);

        if (!$imapSetting) {
            return Response::error(__('Imap settings not found!', 'bit-crm-sales-marketing-automation'));
        }

        try {
            $imapSetting->update($validated);

            Hooks::doAction('bit_crm/imap_configuration_updated', $imapSetting);

            return Response::success(__('Imap settings updated successfully', 'bit-crm-sales-marketing-automation'));
        } catch (Throwable $th) {
            return Response::error(__('Failed to update imap settings!', 'bit-crm-sales-marketing-automation'));
        }
    }

    public function updateStatus(UpdateStatusRequest $request)
    {
        $validated = $request->validated();
        $imapSetting = ImapSetting::findOne(['id' => $validated['id']]);

        if (!$imapSetting) {
            return Response::error(__('Imap settings not found!', 'bit-crm-sales-marketing-automation'));
        }

        try {
            $imapSetting->update(['status' => $validated['status']]);
        } catch (Throwable $th) {
            return Response::error(__('Failed to update status!', 'bit-crm-sales-marketing-automation'));
        }

        return Response::success(__('Status updated successfully', 'bit-crm-sales-marketing-automation'));
    }

    public function destroy(DestroyRequest $request)
    {
        $validated = $request->validated();
        $imapSetting = ImapSetting::where('id', $validated['id']);

        if (!$imapSetting->first()->id) {
            return Response::error(__('Imap settings not found!', 'bit-crm-sales-marketing-automation'));
        }

        try {
            $imapSetting->delete();

            Hooks::doAction('bit_crm/imap_configuration_deleted', $validated['id']);

            return Response::success(__('Imap settings deleted successfully', 'bit-crm-sales-marketing-automation'));
        } catch (Throwable $th) {
            return Response::error(__('Failed to delete imap settings!', 'bit-crm-sales-marketing-automation'));
        }
    }

    public function getImapSettings()
    {
        $currentUserId = get_current_user_id();

        try {
            $imapSettings = ImapSetting::where(
                function ($query) use ($currentUserId) {
                    $query->where('created_by', $currentUserId)
                        ->orWhere('visibility', ImapSetting::VISIBILITY_PUBLIC);
                }
            )
                ->where('status', true)
                ->whereRaw('1=1 ORDER BY CASE WHEN created_by = %s THEN 0 ELSE 1 END, created_by ASC', [$currentUserId])
                ->select(['id', 'title'])
                ->get();
        } catch (Throwable $th) {
            return Response::error(__('Something went wrong! Failed to fetch imap settings!', 'bit-crm-sales-marketing-automation'));
        }

        return Response::success($imapSettings);
    }

    public function fetchEmailsFromImap(FetchEmailRequest $request)
    {
        $validated = $request->validated();
        $emailWithImapId = $validated['email'] . '_' . $validated['imap_id'];
        $cacheKey = 'bit_crm_imap_sync_' . $emailWithImapId;
        $lastSynced = get_transient($cacheKey);

        if (($validated['autoSync'] && $lastSynced) || \intval($validated['imap_id']) === 0) {
            return;
        }

        $latestEmailUid = ImapService::getLatestEmailUid($validated['email'], $validated['imap_id']);
        $afterUid = $latestEmailUid ? \intval($latestEmailUid) + 1 : null;

        set_transient($cacheKey, time(), 2 * HOUR_IN_SECONDS);

        $validated['emailWithImapId'] = $emailWithImapId;
        $validated['afterUid'] = $afterUid;
        $fetchStatusOptionName = ImapSetting::FETCH_STATUS_OPTION_NAME . '_' . $emailWithImapId;

        Config::updateOption($fetchStatusOptionName . '_' . CommonConstant::EMAIL_DIRECTION_RECEIVED, ImapSetting::STATUS_FETCH_PROCESSING);
        Config::updateOption($fetchStatusOptionName . '_' . CommonConstant::EMAIL_DIRECTION_SENT, ImapSetting::STATUS_FETCH_PROCESSING);

        $receivedEmailsQueueData = array_merge($validated, ['emailDirection' => CommonConstant::EMAIL_DIRECTION_RECEIVED]);
        $sentEmailsQueueData = array_merge($validated, ['emailDirection' => CommonConstant::EMAIL_DIRECTION_SENT]);
        $fetchProcess = new FetchImapEmailsProcess();

        $fetchProcess
            ->push_to_queue($receivedEmailsQueueData)
            ->push_to_queue($sentEmailsQueueData)
            ->save()
            ->dispatch();

        return Response::success(__('Emails fetched successfully', 'bit-crm-sales-marketing-automation'));
    }

    public function list()
    {
        if (!Capability::check('bit_crm_setting_imap')) {
            return Response::error(__(' Authorization Error: You don\'t have access!', 'bit-crm-sales-marketing-automation'))->httpStatus(401);
        }

        $currentUserId = get_current_user_id();

        try {
            $imapSettings = ImapSetting::where('created_by', $currentUserId)
                ->where('status', true)
                ->orWhere(
                    function ($query) {
                        $query->where('visibility', ImapSetting::VISIBILITY_PUBLIC)->where('status', true);
                    }
                )
                ->whereRaw('1=1 ORDER BY CASE WHEN created_by = %s THEN 0 ELSE 1 END, created_by ASC', [$currentUserId])
                ->select(['id', 'title', 'username'])
                ->get();
        } catch (Throwable $th) {
            return Response::error(__('Something went wrong! Failed to fetch imap settings!', 'bit-crm-sales-marketing-automation'));
        }

        return Response::success($imapSettings);
    }

    public function queueNotice(Request $request)
    {
        $validated = $request->validate(
            [
                'batchKey' => ['required', 'string']
            ]
        );

        $batchKey = $validated['batchKey'];

        [$fetchStatus, $directions] = ImapService::getFetchStatus($batchKey);

        switch ($fetchStatus) {
            case ImapSetting::STATUS_FETCH_PROCESSING:
                $responseData = [
                    'message'  => __('IMAP emails are currently being fetched. The list will update automatically once the process is complete.', 'bit-crm-sales-marketing-automation'),
                    'status'   => ImapSetting::STATUS_FETCH_PROCESSING,
                    'batchKey' => $batchKey
                ];

                break;

            case ImapSetting::STATUS_FETCH_ERROR:
                $responseData = [
                    'message'  => __('An error occurred while fetching emails. Please check your IMAP settings and try again using the manual fetch button.', 'bit-crm-sales-marketing-automation'),
                    'status'   => ImapSetting::STATUS_FETCH_ERROR,
                    'batchKey' => $batchKey
                ];

                break;

            case ImapSetting::STATUS_FETCH_COMPLETED:
                foreach ($directions as $direction) {
                    $optionName = ImapSetting::FETCH_STATUS_OPTION_NAME . '_' . $batchKey . '_' . $direction;
                    Config::deleteOption($optionName);
                }

                $responseData = [
                    'message'  => __('IMAP emails have been fetched successfully.', 'bit-crm-sales-marketing-automation'),
                    'status'   => ImapSetting::STATUS_FETCH_COMPLETED,
                    'batchKey' => $batchKey
                ];

                break;

            default:
                $responseData = [
                    'message'  => __('IMAP emails are not being fetched currently.', 'bit-crm-sales-marketing-automation'),
                    'status'   => ImapSetting::STATUS_FETCH_IDLE,
                    'batchKey' => $batchKey
                ];

                break;
        }

        return Response::success($responseData);
    }
}
