<?php

namespace BitApps\Crm\src\InvoicePdfTemplate;

final class InvoiceTotals
{
    public float $subtotal;

    public float $totalTax;

    public float $grandTotal;

    public float $discount;

    public bool $isExclusive;

    public bool $isInclusive;

    public function __construct(
        float $subtotal,
        float $totalTax,
        float $grandTotal,
        float $discount,
        bool $isExclusive,
        bool $isInclusive
    ) {
        $this->subtotal = $subtotal;
        $this->totalTax = $totalTax;
        $this->grandTotal = $grandTotal;
        $this->discount = $discount;
        $this->isExclusive = $isExclusive;
        $this->isInclusive = $isInclusive;
    }

    public function taxLabel(): string
    {
        if ($this->isExclusive) {
            return esc_html__('Added', 'bit-crm-sales-marketing-automation');
        }

        if ($this->isInclusive) {
            return esc_html__('Included', 'bit-crm-sales-marketing-automation');
        }

        return esc_html__('No Tax', 'bit-crm-sales-marketing-automation');
    }

    public function hasTax(): bool
    {
        return $this->isExclusive || $this->isInclusive;
    }
}
