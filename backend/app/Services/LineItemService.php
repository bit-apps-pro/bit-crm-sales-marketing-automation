<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Deps\BitApps\WPDatabase\Connection;
use BitApps\Crm\Model\LineItem;
use BitApps\Crm\src\StaticData\CurrencyHelper;
use Exception;
use Throwable;

class LineItemService
{
    protected $entityId;

    protected $module;

    private CurrencyService $currencyService;

    public function __construct($entityId, $module)
    {
        $this->entityId = $entityId;

        $this->module = $module;

        $this->currencyService = new CurrencyService();
    }

    public function getLineItems(): array
    {
        if (empty($this->entityId) || empty($this->module)) {
            return [];
        }

        $lineItems = LineItem::where('entity_id', $this->entityId)
            ->where('module', $this->module)
            ->orderBy('id', 'ASC')
            ->get();

        return !empty($lineItems) ? $lineItems->toArray() : [];
    }

    public function syncLineItems(array $lineItemsData, ?string $entityCurrency = null, string $taxOption = LineItem::TAX_EXCLUSIVE)
    {
        if (empty($this->entityId) || empty($this->module)) {
            return false;
        }

        Connection::startTransaction();

        try {
            $this->deleteLineItems();

            $createdLineItems = $this->createLineItems($lineItemsData, $entityCurrency, $taxOption);

            Connection::commit();

            return $createdLineItems;
        } catch (Throwable $th) {
            Connection::rollback();

            throw new Exception(esc_html__('Failed to create line items', 'bit-crm-sales-marketing-automation'));
        }
    }

    public function deleteLineItems()
    {
        return LineItem::where('entity_id', $this->entityId)
            ->where('module', $this->module)
            ->delete();
    }

    private function createLineItems(array $lineItemsData, ?string $dealCurrency = null, string $taxOption = LineItem::TAX_EXCLUSIVE)
    {
        if (empty($lineItemsData)) {
            return;
        }

        $lineItems = [];
        foreach ($lineItemsData as $itemData) {
            $lineItems[] = $this->prepareLineItemData($itemData, $dealCurrency, $taxOption);
        }

        return LineItem::insert($lineItems);
    }

    private function calculateLineItemTotal(float $unitPrice, int $quantity, int $discountPercentage, int $taxRate, string $taxOption): string
    {
        $baseAmount = $quantity * $unitPrice;
        $discountAmount = $baseAmount * ($discountPercentage / 100);
        $afterDiscount = $baseAmount - $discountAmount;
        $finalAmount = $afterDiscount;

        if ($taxOption === LineItem::TAX_EXCLUSIVE) {
            $taxAmount = $afterDiscount * ($taxRate / 100);
            $finalAmount = $afterDiscount + $taxAmount;
        }

        return number_format(
            $finalAmount,
            LineItem::MONETARY_PRECISION,
            LineItem::MONETARY_DECIMAL_POINT,
            LineItem::MONETARY_THOUSANDS_SEPARATOR
        );
    }

    private function prepareLineItemData(array $itemData, ?string $dealCurrency = null, string $taxOption = LineItem::TAX_EXCLUSIVE): array
    {
        $productData = $this->getProductData($itemData);
        $homeCurrency = CurrencyHelper::getHomeCurrency();
        $quantity = $productData['quantity'];
        $discountPercentage = $productData['discount_percentage'];
        $taxRate = $productData['tax_rate'];
        $unitPriceInDealCurrency = $productData['unit_price'];
        $unitPriceInHomeCurrency = $unitPriceInDealCurrency;

        if ($dealCurrency && $dealCurrency !== $homeCurrency) {
            $unitPriceInHomeCurrency = $this->currencyService->convertIntoHomeCurrency(
                (float) $unitPriceInDealCurrency,
                $dealCurrency
            );
        }

        $totalPriceInDealCurrency = null;
        if ($unitPriceInDealCurrency !== null) {
            $totalPriceInDealCurrency = $this->calculateLineItemTotal(
                (float) $unitPriceInDealCurrency,
                $quantity,
                $discountPercentage,
                $taxRate,
                $taxOption
            );
        }

        $totalPriceInHomeCurrency = null;
        if ($unitPriceInHomeCurrency !== null) {
            $totalPriceInHomeCurrency = $this->calculateLineItemTotal(
                (float) $unitPriceInHomeCurrency,
                $quantity,
                $discountPercentage,
                $taxRate,
                $taxOption
            );
        }

        return [
            'entity_id'                    => $this->entityId,
            'module'                       => $this->module,
            'product_id'                   => $productData['product_id'] ?? null,
            'product_name'                 => $productData['product_name'],
            'product_code'                 => $productData['product_code'],
            'product_source'               => $productData['product_source'],
            'quantity'                     => $quantity,
            'discount_percentage'          => $discountPercentage,
            'tax_rate'                     => $taxRate,
            'unit_price_in_home_currency'  => $unitPriceInHomeCurrency !== null ? (string) $unitPriceInHomeCurrency : null,
            'unit_price_in_deal_currency'  => $unitPriceInDealCurrency !== null ? (string) $unitPriceInDealCurrency : null,
            'total_price_in_home_currency' => $totalPriceInHomeCurrency,
            'total_price_in_deal_currency' => $totalPriceInDealCurrency,
            'description'                  => $itemData['description'] ?? null,
            'created_by'                   => get_current_user_id(),
        ];
    }

    private function getProductData(array $itemData): array
    {
        $unitPrice = max(0, (float) ($itemData['unit_price'] ?? 0));
        $quantity = max(1, (int) ($itemData['quantity'] ?? LineItem::DEFAULT_QUANTITY));
        $discountPercentage = max(0, min(100, (int) ($itemData['discount_percentage'] ?? LineItem::DEFAULT_DISCOUNT)));
        $taxRate = max(0, min(LineItem::MAX_TAX_RATE, (int) ($itemData['tax_rate'] ?? LineItem::DEFAULT_TAX_RATE)));

        return [
            'product_id'          => $itemData['product_id'] ?? null,
            'product_name'        => $itemData['product_name'] ?? '',
            'product_code'        => $itemData['product_code'] ?? '',
            'product_source'      => !empty($itemData['product_source']) ? $itemData['product_source'] : LineItem::SOURCE_PRODUCT,
            'unit_price'          => (string) $unitPrice,
            'tax_rate'            => $taxRate,
            'discount_percentage' => $discountPercentage,
            'quantity'            => $quantity,
        ];
    }
}
