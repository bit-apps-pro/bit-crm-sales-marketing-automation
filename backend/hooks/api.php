<?php

use BitApps\Crm\Deps\BitApps\WPKit\Http\Router\Route;
use BitApps\Crm\HTTP\Controllers\ActivityController;
use BitApps\Crm\HTTP\Controllers\ActivityLogController;
use BitApps\Crm\HTTP\Controllers\AttachmentController;
use BitApps\Crm\HTTP\Controllers\BitFormIntegrationController;
use BitApps\Crm\HTTP\Controllers\BusinessSettingsController;
use BitApps\Crm\HTTP\Controllers\CommonController;
use BitApps\Crm\HTTP\Controllers\CompanyController;
use BitApps\Crm\HTTP\Controllers\ContactController;
use BitApps\Crm\HTTP\Controllers\CurrencyController;
use BitApps\Crm\HTTP\Controllers\DashboardController;
use BitApps\Crm\HTTP\Controllers\DealController;
use BitApps\Crm\HTTP\Controllers\DealStageController;
use BitApps\Crm\HTTP\Controllers\DownloadController;
use BitApps\Crm\HTTP\Controllers\EmailController;
use BitApps\Crm\HTTP\Controllers\ImapController;
use BitApps\Crm\HTTP\Controllers\ImportExportListController;
use BitApps\Crm\HTTP\Controllers\IntegrationSettingsController;
use BitApps\Crm\HTTP\Controllers\InvoiceController;
use BitApps\Crm\HTTP\Controllers\InvoiceTermController;
use BitApps\Crm\HTTP\Controllers\LeadController;
use BitApps\Crm\HTTP\Controllers\LinkController;
use BitApps\Crm\HTTP\Controllers\NoteController;
use BitApps\Crm\HTTP\Controllers\OnboardingController;
use BitApps\Crm\HTTP\Controllers\PluginInstallerController;
use BitApps\Crm\HTTP\Controllers\SettingsController;
use BitApps\Crm\HTTP\Controllers\TagController;
use BitApps\Crm\HTTP\Controllers\TrashController;
use BitApps\Crm\HTTP\Controllers\WooCommerceHistoricalSyncController;

if (!defined('ABSPATH')) {
    exit;
}

Route::group(
    function (): void {
        Route::get('leads/fields', [LeadController::class, 'fieldsWithOrder']);
        Route::get('leads/table-fields', [LeadController::class, 'tableConfiguration']);
        Route::get('leads/conversion-mapping', [LeadController::class, 'conversionMapping']);
        Route::post('leads/store', [LeadController::class, 'store']);
        Route::post('leads/search', [LeadController::class, 'search']);
        Route::post('leads/trash', [LeadController::class, 'trash']);
        Route::post('leads/attach-tag', [LeadController::class, 'attachTag']);
        Route::post('leads/detach-tag', [LeadController::class, 'detachTag']);
        Route::post('leads/attach-tags', [LeadController::class, 'attachTags']);
        Route::post('leads/detach-tags', [LeadController::class, 'detachTags']);
        Route::post('leads/import', [LeadController::class, 'import']);
        Route::post('leads/convert', [LeadController::class, 'convert']);
        Route::post('leads/convert-single', [LeadController::class, 'convertSingle']);
        Route::get('leads/{id}', [LeadController::class, 'show']);
        Route::post('leads/{id}', [LeadController::class, 'update']);

        Route::get('contacts/fields', [ContactController::class, 'fieldsWithOrder']);
        Route::get('contacts/table-fields', [ContactController::class, 'tableConfiguration']);
        Route::post('contacts/store', [ContactController::class, 'store']);
        Route::post('contacts/search', [ContactController::class, 'search']);
        Route::post('contacts/trash', [ContactController::class, 'trash']);
        Route::post('contacts/attach-tag', [ContactController::class, 'attachTag']);
        Route::post('contacts/detach-tag', [ContactController::class, 'detachTag']);
        Route::post('contacts/attach-tags', [ContactController::class, 'attachTags']);
        Route::post('contacts/detach-tags', [ContactController::class, 'detachTags']);
        Route::post('contacts/import', [ContactController::class, 'import']);
        Route::get('contacts/{id}', [ContactController::class, 'show']);
        Route::post('contacts/{id}', [ContactController::class, 'update']);

        Route::get('companies/fields', [CompanyController::class, 'fieldsWithOrder']);
        Route::get('companies/table-fields', [CompanyController::class, 'tableConfiguration']);
        Route::post('companies/store', [CompanyController::class, 'store']);
        Route::post('companies/search', [CompanyController::class, 'search']);
        Route::post('companies/trash', [CompanyController::class, 'trash']);
        Route::post('companies/attach-tag', [CompanyController::class, 'attachTag']);
        Route::post('companies/detach-tag', [CompanyController::class, 'detachTag']);
        Route::post('companies/attach-tags', [CompanyController::class, 'attachTags']);
        Route::post('companies/detach-tags', [CompanyController::class, 'detachTags']);
        Route::post('companies/import', [CompanyController::class, 'import']);
        Route::post('companies/related-entities/detach', [CompanyController::class, 'detachFromRelatedEntities']);
        Route::get('companies/{id}', [CompanyController::class, 'show']);
        Route::post('companies/{id}', [CompanyController::class, 'update']);

        Route::get('deals/fields', [DealController::class, 'fieldsWithOrder']);
        Route::get('deals/table-fields', [DealController::class, 'tableConfiguration']);
        Route::post('deals/store', [DealController::class, 'store']);
        Route::post('deals/search', [DealController::class, 'search']);
        Route::post('deals/trash', [DealController::class, 'trash']);
        Route::post('deals/attach-tag', [DealController::class, 'attachTag']);
        Route::post('deals/detach-tag', [DealController::class, 'detachTag']);
        Route::post('deals/attach-tags', [DealController::class, 'attachTags']);
        Route::post('deals/detach-tags', [DealController::class, 'detachTags']);
        Route::post('deals/import', [DealController::class, 'import']);
        Route::post('deals/update-stage', [DealController::class, 'updateStage']);

        Route::get('deals/stages', [DealStageController::class, 'index']);
        Route::get('deals/stages/archived', [DealStageController::class, 'archived']);
        Route::post('deals/stages/update-sort-order', [DealStageController::class, 'updateSortOrder']);
        Route::post('deals/stages/update', [DealStageController::class, 'update']);
        Route::post('deals/stages/store', [DealStageController::class, 'store']);
        Route::post('deals/stages/archive', [DealStageController::class, 'archive']);
        Route::post('deals/stages/unarchive', [DealStageController::class, 'unarchive']);

        Route::get('deals/contact-currency/{id}', [DealController::class, 'showDealContactCurrency']);
        Route::get('deals/edit/{id}', [DealController::class, 'edit']);
        Route::get('deals/{id}', [DealController::class, 'show']);
        Route::post('deals/{id}', [DealController::class, 'update']);


        Route::post('settings/upsert', [SettingsController::class, 'upsert']);

        Route::post('settings/business/store', [BusinessSettingsController::class, 'store']);
        Route::post('settings/business/update', [BusinessSettingsController::class, 'update']);
        Route::get('settings/business/show', [BusinessSettingsController::class, 'show']);

        Route::get('settings/integration/woo-product', [IntegrationSettingsController::class, 'wooProductIntegration']);
        Route::get('settings/integration/show', [IntegrationSettingsController::class, 'show']);
        Route::post('settings/integration/upsert', [IntegrationSettingsController::class, 'upsert']);

        Route::post('woocommerce/historical-sync/trigger', [WooCommerceHistoricalSyncController::class, 'trigger']);
        Route::get('woocommerce/historical-sync/progress', [WooCommerceHistoricalSyncController::class, 'progress']);

        Route::post('tags/store', [TagController::class, 'store']);
        Route::post('tags/index', [TagController::class, 'index']);
        Route::get('tags/edit/{id}', [TagController::class, 'edit']);
        Route::post('tags/update', [TagController::class, 'update']);
        Route::post('tags/update-pin', [TagController::class, 'updatePin']);
        Route::post('tags/delete', [TagController::class, 'destroy']);
        Route::get('tags/{page}', [TagController::class, 'index']);
        Route::get('tags-by-module', [TagController::class, 'tagsByModule']);

        Route::post('imaps/store', [ImapController::class, 'store']);
        Route::get('imaps/index/{page}', [ImapController::class, 'index']);
        Route::get('imaps/edit/{id}', [ImapController::class, 'edit']);
        Route::post('imaps/update', [ImapController::class, 'update']);
        Route::post('imaps/delete', [ImapController::class, 'destroy']);
        Route::post('imaps/update-status', [ImapController::class, 'updateStatus']);
        Route::get('imaps/list', [ImapController::class, 'list']);
        Route::post('imaps/fetch-imap', [ImapController::class, 'fetchEmailsFromImap']);
        Route::get('imaps/queue-notice', [ImapController::class, 'queueNotice']);

        Route::post('emails/index', [EmailController::class, 'index']);
        Route::get('emails/{id}', [EmailController::class, 'view']);
        Route::post('emails/send', [EmailController::class, 'send']);

        Route::get('activity-logs/index', [ActivityLogController::class, 'index']);

        Route::get('import-export-list/index', [ImportExportListController::class, 'index']);
        Route::post('import-export-list/delete', [ImportExportListController::class, 'destroy']);

        Route::get('activities/index', [ActivityController::class, 'index']);
        Route::get('activities/upcoming', [ActivityController::class, 'upcoming']);
        Route::post('activities/store', [ActivityController::class, 'store']);
        Route::get('activities/notes/{id}', [ActivityController::class, 'activityNotes']);
        Route::post('activities/update', [ActivityController::class, 'update']);
        Route::post('activities/update-status', [ActivityController::class, 'updateStatus']);
        Route::post('activities/delete', [ActivityController::class, 'destroy']);
        Route::post('activities/fields-by-module', [ActivityController::class, 'fieldsByModule']);
        Route::post('activities/entities-by-module', [ActivityController::class, 'entitiesByModule']);
        Route::get('activities/{id}', [ActivityController::class, 'show']);

        Route::get('attachments/index', [AttachmentController::class, 'index']);
        Route::post('attachments/store', [AttachmentController::class, 'store']);
        Route::post('attachments/delete', [AttachmentController::class, 'destroy']);

        Route::get('notes/index', [NoteController::class, 'index']);
        Route::post('notes/store', [NoteController::class, 'store']);
        Route::get('notes/edit/{id}', [NoteController::class, 'edit']);
        Route::post('notes/update', [NoteController::class, 'update']);
        Route::post('notes/delete', [NoteController::class, 'destroy']);
        Route::get('download-media', [DownloadController::class, 'downloadMedia']);

        Route::get('trashes/index', [TrashController::class, 'index']);
        Route::post('trashes/restore', [TrashController::class, 'restore']);
        Route::post('trashes/delete', [TrashController::class, 'destroy']);
        Route::post('trashes/empty', [TrashController::class, 'empty']);

        Route::get('links/index', [LinkController::class, 'index']);
        Route::post('links/store', [LinkController::class, 'store']);
        Route::get('links/edit/{id}', [LinkController::class, 'edit']);
        Route::post('links/update', [LinkController::class, 'update']);
        Route::post('links/delete', [LinkController::class, 'destroy']);

        Route::get('common/sample-csv', [CommonController::class, 'sampleCsv']);
        Route::post('common/related-field-options', [CommonController::class, 'relatedFieldOptions']);
        Route::post('common/related-entities/detach', [CommonController::class, 'detachRelatedEntity']);
        Route::get('common/related-entities/table-fields', [CommonController::class, 'relatedEntitiesTableConfig']);
        Route::post('common/related-entities', [CommonController::class, 'relatedEntities']);
        Route::get('common/entity-related-lists-count', [CommonController::class, 'entityRelatedListsCount']);
        Route::get('common/required-fields', [CommonController::class, 'requiredFields']);

        Route::get('currencies/index', [CurrencyController::class, 'index']);
        Route::get('currencies/static-data', [CurrencyController::class, 'staticData']);
        Route::post('currencies/store-home-currency', [CurrencyController::class, 'storeHomeCurrency']);
        Route::post('currencies/update-home-currency', [CurrencyController::class, 'updateHomeCurrency']);

        Route::get('invoices/terms', [InvoiceTermController::class, 'index']);
        Route::get('invoices/terms/options', [InvoiceTermController::class, 'options']);
        Route::get('invoices/terms/{key}', [InvoiceTermController::class, 'show']);
        Route::post('invoices/terms/store', [InvoiceTermController::class, 'store']);
        Route::post('invoices/terms/update', [InvoiceTermController::class, 'update']);
        Route::post('invoices/terms/delete', [InvoiceTermController::class, 'delete']);

        Route::get('invoices/download', [InvoiceController::class, 'download']);
        Route::post('invoices/store', [InvoiceController::class, 'store']);
        Route::get('invoices/index', [InvoiceController::class, 'index']);
        Route::post('invoices/trash', [InvoiceController::class, 'trash']);
        Route::post('invoices/send', [InvoiceController::class, 'sendInvoice']);
        Route::get('invoices/prefix', [InvoiceController::class, 'invoicePrefix']);
        Route::get('invoices/deals/{id}', [InvoiceController::class, 'invoicesByDeal']);
        Route::get('invoices/line-items/{id}', [InvoiceController::class, 'lineItems']);
        Route::get('invoices/{id}', [InvoiceController::class, 'show']);
        Route::post('invoices/{id}', [InvoiceController::class, 'update']);
        Route::post('invoices/{id}/status', [InvoiceController::class, 'updateStatus']);

        Route::get('plugins/info', [PluginInstallerController::class, 'pluginInfo']);
        Route::post('plugins/install', [PluginInstallerController::class, 'install']);

        Route::get('bit-form/forms', [BitFormIntegrationController::class, 'forms']);
        Route::post('bit-form/toggle-form-status', [BitFormIntegrationController::class, 'toggleFormStatus']);
        Route::post('bit-form/create-form', [BitFormIntegrationController::class, 'createForm']);

        Route::post('onboarding/store', [OnboardingController::class, 'store']);

        Route::get('dashboard/index', [DashboardController::class, 'index']);
    }
)->middleware('isLoggedIn');
