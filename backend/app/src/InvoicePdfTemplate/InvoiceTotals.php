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
            return 'Added';
        }

        if ($this->isInclusive) {
            return 'Included';
        }

        return 'No Tax';
    }

    public function hasTax(): bool
    {
        return $this->isExclusive || $this->isInclusive;
    }
}
