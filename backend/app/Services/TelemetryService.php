<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPDatabase\Collection;
use BitApps\Crm\Deps\BitApps\WPDatabase\QueryBuilder;
use BitApps\Crm\Model\Activity;
use BitApps\Crm\Model\Attachment;
use BitApps\Crm\Model\Company;
use BitApps\Crm\Model\Contact;
use BitApps\Crm\Model\Deal;
use BitApps\Crm\Model\Email;
use BitApps\Crm\Model\ImapSetting;
use BitApps\Crm\Model\ImportExportList;
use BitApps\Crm\Model\Invoice;
use BitApps\Crm\Model\Lead;
use BitApps\Crm\Model\Note;
use BitApps\Crm\Model\Tag;
use BitApps\Crm\Model\Trash;
use BitApps\Crm\src\StaticData\CurrencyHelper;
use Throwable;

/**
 * Usage data for the weekly wp-telemetry report (HookKeys::TELEMETRY_ADDITIONAL_DATA).
 *
 * Counts, booleans and configuration slugs only — never record data, credentials
 * or anything a user typed in. Entity counts exclude trashed rows.
 */
class TelemetryService
{
    /**
     * @param mixed $additionalData
     */
    public function filterTrackingData($additionalData): array
    {
        $additionalData = \is_array($additionalData) ? $additionalData : [];

        try {
            return array_merge($additionalData, $this->getRecordCounts(), $this->getSettingsSummary());
        } catch (Throwable) {
            return $additionalData;
        }
    }

    public function getNoticeHeading(): string
    {
        return \sprintf(
            // Translators: %s: user display name.
            esc_html__('Hi %s, help us make Bit CRM better!', 'bit-crm-sales-marketing-automation'),
            esc_html(wp_get_current_user()->display_name)
        );
    }

    public function getNoticeDescription(): string
    {
        return \sprintf(
            // Translators: %s: link to what is collected.
            esc_html__('Share non-sensitive diagnostic data and usage info about your use of Bit CRM. You can opt out anytime from the Support page. %s', 'bit-crm-sales-marketing-automation'),
            \sprintf(
                '<a href="%s" target="_blank" rel="noopener noreferrer">%s</a>',
                esc_url(Config::TELEMETRY_POLICY_URL),
                esc_html__('What we collect', 'bit-crm-sales-marketing-automation')
            )
        );
    }

    private function getRecordCounts(): array
    {
        $activityTypes = $this->getGroupCounts((new Activity())->newQuery(), 'type');
        $dealStages = $this->getGroupCounts(Deal::where('is_trash', 0), 'stage');
        $invoiceStatuses = $this->getGroupCounts(Invoice::where('is_trash', 0), 'status');
        $imapPlatforms = $this->getGroupCounts((new ImapSetting())->newQuery(), 'platform');
        $importExport = $this->getGroupCounts((new ImportExportList())->newQuery(), 'type');

        return [
            'contactCount'         => Contact::where('is_trash', 0)->count(),
            'leadCount'            => Lead::where('is_trash', 0)->count(),
            'companyCount'         => Company::where('is_trash', 0)->count(),
            'dealCount'            => array_sum($dealStages),
            'dealStageSummary'     => $dealStages,
            'invoiceCount'         => array_sum($invoiceStatuses),
            'invoiceStatusSummary' => $invoiceStatuses,
            'sharedInvoiceCount'   => Invoice::where('is_trash', 0)->whereNotNull('token')->where('token', '!=', '')->count(),
            'activityCount'        => array_sum($activityTypes),
            'activityTypeSummary'  => $activityTypes,
            'noteCount'            => Note::count(),
            'emailCount'           => Email::count(),
            'tagCount'             => Tag::count(),
            'attachmentCount'      => Attachment::count(),
            'trashCount'           => Trash::count(),
            'imapConfigured'       => !empty($imapPlatforms),
            'imapAccountCount'     => array_sum($imapPlatforms),
            'imapProviderSummary'  => $imapPlatforms,
            'importCount'          => $importExport[ImportExportList::IMPORT] ?? 0,
            'exportCount'          => $importExport[ImportExportList::EXPORT] ?? 0,
        ];
    }

    private function getSettingsSummary(): array
    {
        $wooSettings = SettingService::getSettingsValue(
            IntegrationSettingsService::SETTINGS_KEYS['WOOCOMMERCE_INTEGRATION_SETTINGS']
        );

        return [
            'wooSyncEnabled'       => \is_array($wooSettings) && !empty($wooSettings['sync_enabled']),
            'homeCurrency'         => CurrencyHelper::getHomeCurrency(),
            'currencyCount'        => \count((new CurrencyService())->getCurrencyMap()),
            'externalApiUserCount' => (int) (new ExternalApiKeyService())->usersWithKeys(1, 1)['total'],
        ];
    }

    /**
     * Row counts per distinct value of a column: `['task' => 12, 'call' => 3]`.
     *
     * @return array<string, int>
     */
    private function getGroupCounts(QueryBuilder $query, string $column): array
    {
        $rows = $query->select($column)->selectRaw('COUNT(*) as total')->groupBy($column)->get();
        $summary = [];

        foreach ($rows instanceof Collection ? $rows->toArray() : [] as $row) {
            $summary[(string) ($row[$column] ?? '')] = (int) ($row['total'] ?? 0);
        }

        return $summary;
    }
}
