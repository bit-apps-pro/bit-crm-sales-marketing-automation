<?php

namespace BitApps\Crm\HTTP\Controllers;

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Deps\BitApps\WPKit\Http\Response;
use BitApps\Crm\HTTP\Requests\Attachment\DestroyRequest;
use BitApps\Crm\HTTP\Requests\Attachment\IndexRequest;
use BitApps\Crm\HTTP\Requests\Attachment\StoreRequest;
use BitApps\Crm\Model\Attachment;

final class AttachmentController
{
    public const DEFAULT_PER_PAGE = 20;

    public function index(IndexRequest $request)
    {
        $validated = $request->validated();
        $wpUsersTable = Config::get('WP_DB_PREFIX') . 'users';

        $query = Attachment::selectRaw("(SELECT display_name FROM {$wpUsersTable} WHERE ID = created_by) AS uploader")
            ->where('module', $validated['module'])
            ->where('entity_id', $validated['entityId']);

        if (!empty($validated['search'])) {
            $query->where('file_name', 'LIKE', '%' . $validated['search'] . '%');
        }

        $attachments = $query->orderBy('created_at')->desc()
            ->paginate($validated['page'], $validated['perPage'] ?? self::DEFAULT_PER_PAGE);

        return Response::success($attachments);
    }

    public function store(StoreRequest $request)
    {
        $validated = $request->validated();

        $storedAttachments = Attachment::where('module', $validated['module'])
            ->where('entity_id', $validated['entity_id'])
            ->select(['id', 'media_id'])
            ->get();

        $storedMediaIds = [];

        if (!empty($storedAttachments)) {
            $storedMediaIds = $storedAttachments->pluck('media_id')->toArray();
        }

        $meta = [
            'entity_id'  => $validated['entity_id'],
            'module'     => $validated['module'],
            'created_by' => get_current_user_id()
        ];

        $data = [];
        $skipCount = 0;

        foreach ($validated['attachments'] as $attachment) {
            if (\in_array($attachment['media_id'], $storedMediaIds)) {
                ++$skipCount;

                continue;
            }

            $data[] = array_merge($attachment, $meta);
        }

        if (empty($data)) {
            return Response::success(
                \sprintf(
                    // translators: %d: Number of attachments that were skipped because they already exist
                    __('%d attachments already exist; skipped creation!', 'bit-crm'),
                    $skipCount
                )
            );
        }

        if ($attachment = Attachment::insert($data)) {
            $message = $skipCount > 0
                ? \sprintf(
                    // translators: 1: Number of attachments created, 2: Number of attachments that already existed
                    __('%1$d attachments created successfully, %2$d already exist.', 'bit-crm'),
                    \count($data),
                    $skipCount
                )
                : \sprintf(
                    // translators: %d: Number of attachments created
                    __('%d attachments created successfully.', 'bit-crm'),
                    \count($data)
                );

            Hooks::doAction('bit_crm/attachment_created', $attachment);

            return Response::success($message);
        }

        return Response::error(__('Failed to create attachment!', 'bit-crm'));
    }

    public function destroy(DestroyRequest $request)
    {
        $validated = $request->validated();
        $attachment = new Attachment($validated['id']);

        if (!$attachment->exists()) {
            return Response::error(__('Attachment not found!', 'bit-crm'));
        }

        if ($attachment->delete()) {
            Hooks::doAction('bit_crm/attachment_deleted', $validated['id']);

            return Response::success(__('Attachment deleted successfully!', 'bit-crm'));
        }

        return Response::error(__('Failed to delete attachment!', 'bit-crm'));
    }
}
