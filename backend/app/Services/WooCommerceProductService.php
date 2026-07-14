<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Constants\HookKeys;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\src\StaticData\CurrencyHelper;
use BitApps\Crm\Traits\FormatPagination;

class WooCommerceProductService
{
    use FormatPagination;

    public const MODULE_NAME = 'woo_commerce_product';

    /**
     * Get all WooCommerce products.
     *
     * @param null|string $searchTerm search term to filter products
     *
     * @return array formatted WooCommerce products
     */
    public function getProducts(?string $searchTerm = null): array
    {
        if (!$this->isPluginActive()) {
            return [
                'error' => __('The WooCommerce plugin is not installed or activated.', 'bit-crm-sales-marketing-automation'),
            ];
        }

        $args = [
            'status'       => 'publish',
            'stock_status' => 'instock',
            'limit'        => -1,
        ];

        if (!empty($searchTerm)) {
            $args['s'] = $searchTerm;
        }

        $products = $this->getWcProducts($args);

        return $this->formatProductsData($products);
    }

    /**
     * Get paginated WooCommerce products.
     *
     * @param int $pageNo the page number
     * @param int $perPage number of products per page
     * @param null|string $searchTerm search term to filter products
     *
     * @return array formatted paginated WooCommerce products
     */
    public function getPaginatedProducts(int $pageNo, int $perPage, ?string $searchTerm = null): array
    {
        if (!$this->isPluginActive()) {
            return [
                'error' => __('The WooCommerce plugin is not installed or activated.', 'bit-crm-sales-marketing-automation'),
            ];
        }

        $args = [
            'status'       => 'publish',
            'stock_status' => 'instock',
            'paginate'     => true,
            'limit'        => $perPage,
            'page'         => $pageNo,
        ];

        if (!empty($searchTerm)) {
            $args['s'] = $searchTerm;
        }

        $paginatedProducts = $this->getWcProducts($args);
        $products = $paginatedProducts->products ?? [];
        $total = $paginatedProducts->total ?? 0;
        $productsData = $this->formatProductsData($products);

        return $this->formatPagination($productsData, $pageNo, $perPage, $total);
    }

    /**
     * Get WooCommerce products as options for dropdowns or selection fields.
     *
     * @param array|bool $pagination pagination parameters or false for no pagination
     * @param null|string $searchTerm search term to filter products
     *
     * @return array formatted WooCommerce products as options
     */
    public function getProductsAsOptions(array|bool $pagination = false, ?string $searchTerm = null): array
    {
        if (!$this->isPluginActive()) {
            return [
                'error' => __('The WooCommerce plugin is not installed or activated.', 'bit-crm-sales-marketing-automation'),
            ];
        }

        if (\is_array($pagination) && isset($pagination['pageNo'], $pagination['perPage'])) {
            $products = $this->getPaginatedProducts($pagination['pageNo'], $pagination['perPage'], $searchTerm);
            $options = $this->formatDataAsOptions($products['data']);
            $products['data'] = $options;

            return $products;
        }

        $products = $this->getProducts($searchTerm);

        return $this->formatDataAsOptions($products);
    }

    /**
     * Get a single WooCommerce product as an option for dropdowns or selection fields.
     *
     * @param int $id the ID of the product
     *
     * @return array|bool formatted WooCommerce product as an option or false if not found
     */
    public function getProductAsOption(int $id): array|bool
    {
        if (!$this->isPluginActive()) {
            return [
                'error' => __('The WooCommerce plugin is not installed or activated.', 'bit-crm-sales-marketing-automation'),
            ];
        }

        $product = $this->getWcProductById($id);

        if (!$product) {
            return false;
        }

        $parentId = $product->get_parent_id();
        $finalProduct = $parentId ? $this->getWcProductById($parentId) : $product;

        if (!$finalProduct) {
            return false;
        }

        $formattedData = $this->formatProductsData([$finalProduct]);
        $options = $this->formatDataAsOptions($formattedData);

        return $options[0] ?? false;
    }

    /**
     * Get entities as options for dropdowns or selection fields.
     *
     * This method is a wrapper around getProductsAsOptions to maintain consistency
     * with other entity services.
     *
     * @param array|bool $pagination pagination parameters or false for no pagination
     * @param null|string $searchTerm search term to filter entities
     *
     * @return array formatted entities as options
     */
    public function getEntitiesAsOptions(array|bool $pagination = false, int $skipId = 0, ?string $searchTerm = null): array
    {
        return $this->getProductsAsOptions($pagination, $searchTerm);
    }

    /**
     * Get a single entity as an option for dropdowns or selection fields.
     *
     * This method is a wrapper around getProductAsOption to maintain consistency
     * with other entity services.
     *
     * @param int $id the ID of the entity
     *
     * @return array|bool formatted entity as an option or false if not found
     */
    public function getEntityAsOption(int $id): array|bool
    {
        return $this->getProductAsOption($id);
    }

    /**
     * Check if WooCommerce plugin is active.
     *
     * @return bool true if WooCommerce is active, false otherwise
     */
    public function isPluginActive(): bool
    {
        return class_exists('WooCommerce');
    }

    private function resolveExchangeRate(string $wcCurrency): float
    {
        $homeCurrency = CurrencyHelper::getHomeCurrency();

        if (!$wcCurrency || $wcCurrency === $homeCurrency) {
            return 1.0;
        }

        $currencies = Hooks::applyFilter(HookKeys::OTHER_CURRENCIES_DATA, []);

        return isset($currencies[$wcCurrency]['exchange_rate'])
            ? (float) $currencies[$wcCurrency]['exchange_rate']
            : 1.0;
    }

    /**
     * Format products data.
     *
     * Formats an array of WooCommerce product objects into a structured array.
     *
     * @param array $products array of WooCommerce product objects
     *
     * @return array formatted products data
     */
    private function formatProductsData(array $products): array
    {
        $formatted = [];
        $currency = $this->getWooCommerceCurrency();
        $exchangeRate = $this->resolveExchangeRate($currency);

        foreach ($products as $product) {
            // TODO: will be added is_purchasable check later (still need to figure out should we skip non-purchasable products or include them with a flag)
            // check is variable product is instance of WC_Product_Variable
            if ($product->is_type('variable')) {
                $formatted[] = $this->getVariableProductData($product, $currency, $exchangeRate);

                continue;
            }

            $data = array_merge($this->getSimpleProductData($product, $currency, $exchangeRate), $this->getTaxInfo($product));
            $formatted[] = $data;
        }

        return $formatted;
    }

    /**
     * Get data for simple products.
     *
     * format the simple product (non-variable) data into an associative array.
     *
     * @param mixed $product the WooCommerce product object
     *
     * @return array formatted product data
     */
    private function getSimpleProductData($product, string $currency, float $exchangeRate): array
    {
        return [
            'id'          => (string) $product->get_id(),
            'name'        => $product->get_formatted_name(),
            'price'       => (string) ((float) $product->get_price() / $exchangeRate),
            'currency'    => $currency,
            'description' => $product->get_short_description(),
            'sku'         => $product->get_sku(),
        ];
    }

    /**
     * Get data for variable products.
     *
     * format the variable product data into an associative array,
     * including its variations.
     *
     * @param mixed $product the WooCommerce variable product object
     *
     * @return array formatted variable product data
     */
    private function getVariableProductData($product, string $currency, float $exchangeRate): array
    {
        $data = [
            'id'       => $product->get_id(),
            'name'     => $product->get_formatted_name(),
            'currency' => $currency,
        ];

        $variationIds = $product->get_children();
        $variationData = [];

        foreach ($variationIds as $variationId) {
            $variationObj = $this->getWcProductById($variationId);

            // will be added is_purchasable() check later
            if (!$variationObj) {
                continue;
            }

            $varData = [
                'id'          => (string) $variationObj->get_id(),
                'name'        => $variationObj->get_name(),
                'description' => $variationObj->get_description(),
                'price'       => (string) ((float) $variationObj->get_price() / $exchangeRate),
                'sku'         => $variationObj->get_sku(),
                'code'        => $variationObj->get_sku(),
                'is_parent'   => false,
                'currency'    => $currency,
            ];

            $varData = array_merge($varData, $this->getTaxInfo($variationObj));
            $variationData[] = $varData;
        }

        $data['children'] = $variationData;

        return $data;
    }

    /**
     * Format data as options for dropdowns or selection fields.
     *
     * @param array $products array of formatted products data
     *
     * @return array formatted WooCommerce products data as options
     */
    private function formatDataAsOptions(array $products): array
    {
        $formatted = [];

        foreach ($products as $product) {
            $option = [
                'value' => $product['id'],
                'label' => $product['name'],
            ];

            if (isset($product['children']) && \is_array($product['children'])) {
                $option['is_parent'] = true;
                $option['children'] = $this->formatDataAsOptions($product['children']);
            } else {
                $productData = $product;
                $productData['source'] = 'woo_commerce_product'; // Add source identifier
                $option['data'] = $productData;
            }

            $formatted[] = $option;
        }

        return $formatted;
    }

    /**
     * Get tax information for a product.
     *
     * Calculates tax rate, price including tax, and price excluding tax
     * for the given WooCommerce product.
     *
     * @param mixed $product the WooCommerce product object
     *
     * @return array tax information including tax rate, price including tax, and price excluding tax
     */
    private function getTaxInfo($product)
    {
        $price = $product->get_price();

        $taxInfo = [
            'tax_rate'            => 0,
            'price_including_tax' => $price,
            'price_excluding_tax' => $price,
        ];

        if (!\function_exists('wc_tax_enabled') || !wc_tax_enabled() || $product->get_tax_status() !== 'taxable') {
            return $taxInfo;
        }

        $taxInfo['price_including_tax'] = \function_exists('wc_get_price_including_tax')
         ? wc_get_price_including_tax($product, ['qty' => 1]) : $price;
        $taxInfo['price_excluding_tax'] = \function_exists('wc_get_price_excluding_tax')
         ? wc_get_price_excluding_tax($product, ['qty' => 1]) : $price;

        $this->calculateTaxRate($taxInfo);

        return $taxInfo;
    }

    /**
     * Calculate tax rate based on price including and excluding tax.
     *
     * @param array $taxInfo reference to the tax information array
     */
    private function calculateTaxRate(&$taxInfo)
    {
        if (!isset($taxInfo['price_including_tax'], $taxInfo['price_excluding_tax'])) {
            return;
        }

        $priceExcludingTax = (float) $taxInfo['price_excluding_tax'];

        if ($priceExcludingTax <= 0) {
            return;
        }

        $priceIncludingTax = (float) $taxInfo['price_including_tax'];
        $taxInfo['tax_rate'] = ($priceIncludingTax - $priceExcludingTax) / $priceExcludingTax * 100;
    }

    /**
     * Get the active WooCommerce currency code.
     *
     * wrapper for get_woocommerce_currency function.
     *
     * @return string currency code (e.g. 'USD')
     */
    private function getWooCommerceCurrency(): string
    {
        if (\function_exists('get_woocommerce_currency')) {
            return get_woocommerce_currency();
        }

        return '';
    }

    /**
     * Get WooCommerce products based on arguments.
     *
     * wrapper for wc_get_products function.
     *
     * @param array $args arguments to filter products
     *
     * @return array array of WooCommerce product objects
     */
    private function getWcProducts(array $args)
    {
        if (\function_exists('wc_get_products')) {
            return wc_get_products($args);
        }

        return [];
    }

    /**
     * Get a WooCommerce product by ID.
     *
     * wrapper for wc_get_product function.
     *
     * @param int $id the ID of the product
     *
     * @return mixed the WooCommerce product object or false if not found
     */
    private function getWcProductById(int $id)
    {
        if (\function_exists('wc_get_product')) {
            return wc_get_product($id);
        }

        return false;
    }
}
