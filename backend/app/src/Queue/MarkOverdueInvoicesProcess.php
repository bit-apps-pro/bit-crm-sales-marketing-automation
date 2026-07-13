<?php

namespace BitApps\Crm\src\Queue;

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Model\Invoice;
use BitApps\Crm\Utils\Logger;
use Throwable;
use WP_Background_Process;

class MarkOverdueInvoicesProcess extends WP_Background_Process
{
    public const IS_RUNNING_KEY = 'is_mark_overdue_invoices_queue_in_process';

    protected const CHUNK_SIZE = 2000;

    protected $action = Config::VAR_PREFIX . 'mark_overdue_invoices';

    protected function task($item)
    {
        $lastId = (int) ($item['last_id'] ?? 0);
        // Use site timezone to match InvoiceController's inline overdue check
        // (line 109). due_date is stored as the user-picked string with no
        // conversion, so comparisons must use the same TZ the user picked in.
        $today = current_time('Y-m-d');

        try {
            // Resolve this chunk's upper bound via the PRIMARY index. Using a
            // range (id > lastId AND id <= chunkMaxId) lets the UPDATE run
            // without building a large IN(...) clause.
            $chunkBoundary = Invoice::select(['id'])
                ->where('is_trash', false)
                ->where('status', Invoice::STATUS_SENT)
                ->where('due_date', '<', $today)
                ->where('id', '>', $lastId)
                ->asc()
                ->skip(self::CHUNK_SIZE - 1)
                ->take(1)
                ->first();

            $hasMore = !empty($chunkBoundary);
            $chunkMaxId = $hasMore ? (int) $chunkBoundary->id : 0;

            $query = Invoice::where('is_trash', false)
                ->where('status', Invoice::STATUS_SENT)
                ->where('due_date', '<', $today)
                ->where('id', '>', $lastId);

            if ($hasMore) {
                $query->where('id', '<=', $chunkMaxId);
            }

            $query->update(['status' => Invoice::STATUS_OVERDUE]);

            return $hasMore ? ['last_id' => $chunkMaxId] : false;
        } catch (Throwable $th) {
            Logger::error('Failed to mark overdue invoices', ['error' => $th]);

            return false;
        }
    }

    protected function complete()
    {
        Config::deleteOption(self::IS_RUNNING_KEY);
        Hooks::doAction(Config::withPrefix('overdue_invoices_marked_completed'));
        parent::complete();
    }
}
