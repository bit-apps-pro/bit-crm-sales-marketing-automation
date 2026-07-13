<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPDatabase\Model;
use BitApps\Crm\Deps\BitApps\WPDatabase\QueryBuilder;
use BitApps\Crm\Model\Contact;
use BitApps\Crm\Model\Deal;
use BitApps\Crm\Model\Invoice;
use BitApps\Crm\Model\LineItem;
use BitApps\Crm\src\Queue\MarkOverdueInvoicesProcess;
use BitApps\Crm\src\StaticData\CurrencyHelper;
use BitApps\Crm\Utils\Logger;
use Throwable;

class InvoiceService
{
    public static function generateInvoiceFileName(string $prefix, int $id): string
    {
        $safePrefix = sanitize_file_name($prefix);

        return Invoice::MODULE_NAME . '-' . $safePrefix . '-' . $id . '.pdf';
    }

    public static function getInvoiceDetails(int $invoiceId): ?array
    {
        try {
            $result = self::invoiceJoinQuery($invoiceId)->first();

            if (!$result instanceof Invoice) {
                return null;
            }

            $row = $result->getAttributes();

            $invoice = self::hydrate(new Invoice(), self::columnsByAlias($row, new Invoice()));
            $deal = self::hydrate(new Deal(), self::columnsByAlias($row, new Deal()));
            $contact = self::hydrate(new Contact(), self::columnsByAlias($row, new Contact()));

            $lineItems = LineItem::find(['entity_id' => $invoice->id, 'module' => Invoice::MODULE_NAME]);

            $lineItems = !empty($lineItems) ? $lineItems->toArray() : [];

            return [
                'invoice'       => $invoice,
                'deal'          => $deal,
                'contact'       => $contact,
                'line_items'    => $lineItems,
                'currency_data' => self::getDealCurrencyData($deal),
            ];
        } catch (Throwable $th) {
            Logger::error($th);

            return null;
        }
    }

    public static function sendInvoice($email, $attachments)
    {
        $subject = __('Your Invoice', 'bit-crm');
        $message = __('Please find your invoice attached.', 'bit-crm');
        $headers = ['Content-Type: text/html; charset=UTF-8'];

        return wp_mail($email, $subject, $message, $headers, $attachments);
    }

    public static function runOverdueInvoiceCheck(): void
    {
        $startedAt = (int) Config::getOption(MarkOverdueInvoicesProcess::IS_RUNNING_KEY);

        /*
         * Skip if a previous run is still in flight, but treat the flag as
         * stale if it's older than a day — guards against fatal-error orphans
         * that would otherwise block every subsequent daily run.
         */
        if ($startedAt > 0 && (time() - $startedAt) < DAY_IN_SECONDS) {
            return;
        }

        Config::updateOption(MarkOverdueInvoicesProcess::IS_RUNNING_KEY, time());

        (new MarkOverdueInvoicesProcess())
            ->push_to_queue([])
            ->save()
            ->dispatch();
    }

    public static function getDealCurrencyData(Deal $deal)
    {
        $currencies = (new CurrencyService())->getCurrencyMap();

        return $currencies[$deal->currency] ?? CurrencyHelper::getHomeCurrencyData();
    }

    private static function invoiceJoinQuery(int $invoiceId): QueryBuilder
    {
        $invoiceTable = Config::withDBPrefix('invoices');
        $dealTable = Config::withDBPrefix('deals');
        $contactTable = Config::withDBPrefix('contacts');

        $select = array_merge(
            self::aliasColumns($invoiceTable, new Invoice()),
            self::aliasColumns($dealTable, new Deal()),
            self::aliasColumns($contactTable, new Contact())
        );

        return Invoice::select($select)
            ->join('deals', "{$dealTable}.id", '=', "{$invoiceTable}.entity_id")
            ->join('contacts', "{$contactTable}.id", '=', "{$dealTable}.contact_id")
            ->where("{$invoiceTable}.id", $invoiceId)
            ->where("{$invoiceTable}.module", Deal::MODULE_NAME);
    }

    /**
     * @param Contact|Deal|Invoice $model
     */
    private static function aliasColumns(string $table, Model $model): array
    {
        $alias = $model::MODULE_NAME . '_';
        $columns = array_merge($model->getFillable(), ['id', 'created_at', 'updated_at']);

        return array_map(
            static fn ($column) => "{$table}.{$column} AS {$alias}{$column}",
            $columns
        );
    }

    /**
     * @param Contact|Deal|Invoice $model
     */
    private static function columnsByAlias(array $row, Model $model): array
    {
        $alias = $model::MODULE_NAME . '_';
        $columns = [];

        foreach ($row as $key => $value) {
            if (strncmp($key, $alias, \strlen($alias)) === 0) {
                $columns[substr($key, \strlen($alias))] = $value;
            }
        }

        return $columns;
    }

    private static function hydrate($model, array $attributes)
    {
        $model->fill($attributes, true);
        $model->setExists(true);

        return $model;
    }
}
