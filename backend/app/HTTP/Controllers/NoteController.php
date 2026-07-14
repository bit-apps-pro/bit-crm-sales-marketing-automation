<?php

namespace BitApps\Crm\HTTP\Controllers;

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Deps\BitApps\WPKit\Http\Response;
use BitApps\Crm\HTTP\Requests\Note\DestroyRequest;
use BitApps\Crm\HTTP\Requests\Note\EditRequest;
use BitApps\Crm\HTTP\Requests\Note\IndexRequest;
use BitApps\Crm\HTTP\Requests\Note\StoreRequest;
use BitApps\Crm\HTTP\Requests\Note\UpdateRequest;
use BitApps\Crm\Model\Note;
use BitApps\Crm\Services\NoteService;

final class NoteController
{
    public const DEFAULT_PER_PAGE = 10;

    public function index(IndexRequest $request)
    {
        $validated = $request->validated();

        $wpUsersTable = Config::get('WP_DB_PREFIX') . 'users';

        $query = Note::selectRaw("(SELECT display_name FROM {$wpUsersTable} WHERE ID = created_by) AS created_by")
            ->where('module', $validated['module'])
            ->where('entity_id', $validated['entityId']);

        if (!empty($validated['search'])) {
            $query->where(
                function ($query) use ($validated) {
                    $query->where('title', 'LIKE', '%' . $validated['search'] . '%')
                        ->orWhere('details', 'LIKE', '%' . $validated['search'] . '%');
                }
            );
        }

        if ($validated['sortOrder'] === Note::SORT_RECENT_LAST) {
            $query->orderBy('created_at')->asc();
        } else {
            $query->orderBy('created_at')->desc();
        }

        $notes = $query->paginate($validated['page'], $validated['perPage'] ?? self::DEFAULT_PER_PAGE);

        $notes['data'] = NoteService::formatDataCollection($notes['data'], $validated['module'], $validated['entityId']);

        return Response::success($notes);
    }

    public function store(StoreRequest $request)
    {
        $validated = $request->validated();
        $validated['created_by'] = get_current_user_id();

        if (empty($validated['attachments'])) {
            unset($validated['attachments']);
        }

        if ($note = Note::insert($validated)) {
            Hooks::doAction('bit_crm/note_created', $note);

            return Response::success(__('Note created successfully!', 'bit-crm-sales-marketing-automation'));
        }

        return Response::error(__('Failed to create note!', 'bit-crm-sales-marketing-automation'));
    }

    public function edit(EditRequest $request)
    {
        $validated = $request->validated();
        $note = Note::findOne(['id' => $validated['id']]);

        if (empty($note)) {
            return Response::error(__('Note not found!', 'bit-crm-sales-marketing-automation'));
        }

        return Response::success($note);
    }

    public function update(UpdateRequest $request)
    {
        $validated = $request->validated();
        $note = Note::findOne(['id' => $validated['id']]);

        if (empty($note)) {
            return Response::error(__('Note not found!', 'bit-crm-sales-marketing-automation'));
        }

        $validated['updated_by'] = get_current_user_id();

        if (empty($validated['attachments'])) {
            $validated['attachments'] = null;
        }

        if ($note->update($validated)) {
            Hooks::doAction('bit_crm/note_updated', $note);

            return Response::success($note);
        }

        return Response::error(__('Failed to update note!', 'bit-crm-sales-marketing-automation'));
    }

    public function destroy(DestroyRequest $request)
    {
        $validated = $request->validated();
        $note = new Note($validated['id']);

        if (!$note->exists()) {
            return Response::error(__('Note not found!', 'bit-crm-sales-marketing-automation'));
        }

        if ($note->delete()) {
            Hooks::doAction('bit_crm/note_deleted', $validated['id']);

            return Response::success(__('Note deleted successfully!', 'bit-crm-sales-marketing-automation'));
        }

        return Response::error(__('Failed to delete note!', 'bit-crm-sales-marketing-automation'));
    }
}
