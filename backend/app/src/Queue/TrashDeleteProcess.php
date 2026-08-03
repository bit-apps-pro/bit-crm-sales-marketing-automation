<?php

namespace BitApps\Crm\src\Queue;

use BitApps\Crm\Config;
use BitApps\Crm\Model\Trash;
use BitApps\Crm\Services\TrashService;

class TrashDeleteProcess extends SafeBackgroundProcess
{
    protected const CHUNK_SIZE = 50;

    protected $action = Config::VAR_PREFIX . 'trash_delete';

    protected function task($item)
    {
        $lastId = $item['last_id'] ?? 0;

        $trashQuery = Trash::select(['entity_id', 'module', 'id'])
            ->where('id', '>', $lastId)
            ->orderBy('id', 'asc')
            ->take(self::CHUNK_SIZE);

        if (!$trashQuery->count()) {
            Config::deleteOption(Trash::IS_QUEUE_IN_PROCESS_KEY);

            return false;
        }

        $trashes = $trashQuery->get()->toArray();

        TrashService::deleteTrashes($trashes);

        $lastProcessedId = end($trashes)['id'];

        return ['last_id' => $lastProcessedId];
    }
}
