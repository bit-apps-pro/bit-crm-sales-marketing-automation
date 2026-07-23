<?php

namespace BitApps\Crm;

use BitApps\Crm\Deps\BitApps\WPDatabase\QueryBuilder;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Deps\BitApps\WPKit\Http\RequestType;
use BitApps\Crm\Deps\BitApps\WPKit\Migration\MigrationHelper;
use BitApps\Crm\Deps\BitApps\WPKit\Utils\Capabilities;
use BitApps\Crm\HTTP\Middleware\LoggedInMiddleware;
use BitApps\Crm\Providers\HookProvider;
use BitApps\Crm\Providers\InstallerProvider;
use BitApps\Crm\src\Queue\CompaniesCsvImportProcess;
use BitApps\Crm\src\Queue\ContactsCsvImportProcess;
use BitApps\Crm\src\Queue\DealsCsvImportProcess;
use BitApps\Crm\src\Queue\FetchImapEmailsProcess;
use BitApps\Crm\src\Queue\InstallPluginsProcess;
use BitApps\Crm\src\Queue\LeadsConvertToContactsProcess;
use BitApps\Crm\src\Queue\LeadsCsvImportProcess;
use BitApps\Crm\src\Queue\MarkOverdueInvoicesProcess;
use BitApps\Crm\src\Queue\TrashDeleteProcess;
use BitApps\Crm\src\Queue\WooCommerceContactSyncProcess;
use BitApps\Crm\src\Queue\WooCommerceHistoricalSyncProcess;
use BitApps\Crm\Views\HtmlTagModifier;
use BitApps\Crm\Views\Layout;
use BitApps\Crm\Views\PluginPageActions;

final class Plugin
{
    /**
     * Main instance of the plugin.
     *
     * @since 1.0.0-alpha
     *
     * @var null|Plugin
     */
    private static $_instance;

    private $_registeredMiddleware = [];

    /**
     * Container for holding instances.
     *
     * @var array
     */
    private $container = [];

    /**
     * Initialize the Plugin with hooks.
     */
    public function __construct()
    {
        // Connection::setPluginPrefix(Config::VAR_PREFIX);

        $this->registerInstaller();
        $this->setUTCTimezone();

        Hooks::addAction('plugins_loaded', [$this, 'loaded']);

        // Ensure that instances of background process classes are created
        $this->ensureInstance();
    }

    public function registerInstaller()
    {
        $installerProvider = new InstallerProvider();
        $installerProvider->register();
    }

    /**
     * Load the plugin.
     */
    public function loaded()
    {
        Hooks::doAction(Config::withPrefix('loaded'));

        Hooks::addAction('init', [$this, 'registerProviders'], 11);

        Hooks::addFilter('plugin_action_links_' . Config::get('BASENAME'), [new PluginPageActions(), 'renderActionLinks']);

        $this->maybeMigrateDB();
    }

    public function middlewares()
    {
        return [
            'isLoggedIn' => LoggedInMiddleware::class,
        ];
    }

    public function getMiddleware($name)
    {
        if (isset($this->_registeredMiddleware[$name])) {
            return $this->_registeredMiddleware[$name];
        }

        $middlewares = $this->middlewares();
        if (isset($middlewares[$name]) && class_exists($middlewares[$name]) && method_exists($middlewares[$name], 'handle')) {
            $this->_registeredMiddleware[$name] = new $middlewares[$name]();
        } else {
            return false;
        }

        return $this->_registeredMiddleware[$name];
    }

    public function setUTCTimezone()
    {
        QueryBuilder::$TIME_ZONE = 'UTC';
    }

    /**
     * Ensures that instances of specific classes exist in the container for predefined keys.
     *
     * This method checks if the container has instances of the classes mapped to the keys
     * 'leads_csv_export_process', 'companies_csv_export_process', 'companies_csv_import_process', 'fetch_imap_emails_process' or others. If an instance does not exist
     * or is not of the correct class, a new instance is created and assigned to the container.
     *
     * @return array the updated container with ensured class instances
     */
    public function ensureInstance(): array
    {
        $classMap = [
            'leads_csv_import_process'            => LeadsCsvImportProcess::class,
            'contacts_csv_import_process'         => ContactsCsvImportProcess::class,
            'companies_csv_import_process'        => CompaniesCsvImportProcess::class,
            'deals_csv_import_process'            => DealsCsvImportProcess::class,
            'leads_convert_to_contacts_process'   => LeadsConvertToContactsProcess::class,
            'fetch_imap_emails_process'           => FetchImapEmailsProcess::class,
            'trash_delete_process'                => TrashDeleteProcess::class,
            'install_plugins_process'             => InstallPluginsProcess::class,
            'woocommerce_contact_sync_process'    => WooCommerceContactSyncProcess::class,
            'woocommerce_historical_sync_process' => WooCommerceHistoricalSyncProcess::class,
            'mark_overdue_invoices_process'       => MarkOverdueInvoicesProcess::class,

        ];

        foreach ($classMap as $key => $class) {
            if (empty($key) || !class_exists($class)) {
                continue;
            }

            if (empty($this->container[$key]) || !($this->container[$key] instanceof $class)) {
                $this->container[$key] = new $class();
            }
        }

        return $this->container;
    }

    /**
     * Instantiate the Provider class.
     */
    public function registerProviders()
    {
        if (RequestType::is('admin')) {
            new Layout();
            new HtmlTagModifier();
        }
        new HookProvider();
    }

    public static function maybeMigrateDB()
    {
        if (!Capabilities::check('manage_options')) {
            return;
        }

        if (version_compare(Config::getOption('db_version'), Config::DB_VERSION, '<')) {
            MigrationHelper::migrate(InstallerProvider::migration());
        }
    }

    /**
     * Retrieves the main instance of the plugin.
     *
     * @since 1.0.0-alpha
     *
     * @return Plugin plugin main instance
     */
    public static function instance()
    {
        return self::$_instance;
    }

    /**
     * Loads the plugin main instance and initializes it.
     *
     * @return bool True if the plugin main instance could be loaded, false otherwise
     *
     * @since 1.0.0-alpha
     */
    public static function load()
    {
        if (self::$_instance !== null) {
            return false;
        }

        self::$_instance = new self();

        return true;
    }
}
