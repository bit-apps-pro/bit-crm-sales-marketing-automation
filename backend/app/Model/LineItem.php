<?php

namespace BitApps\Crm\Model;

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPDatabase\Model;

class LineItem extends Model
{
    public const MODULE_NAME = 'line_item';

    public const MONETARY_PRECISION = 4;

    public const MONETARY_DECIMAL_POINT = '.';

    public const MONETARY_THOUSANDS_SEPARATOR = '';

    public const SOURCE_PRODUCT = 'product';

    public const SOURCE_WOOCOMMERCE = 'woo_commerce_product';

    public const SOURCE_CUSTOM = 'custom';

    public const TAX_EXCLUSIVE = 'exclusive';

    public const TAX_INCLUSIVE = 'inclusive';

    public const TAX_NO_TAX = 'no_tax';

    public const DEFAULT_QUANTITY = 1;

    public const DEFAULT_DISCOUNT = 0;

    public const DEFAULT_TAX_RATE = 0;

    public const MAX_TAX_RATE = 1000;

    protected $table = 'line_items';

    protected $prefix = Config::VAR_PREFIX;

    protected $fillable = [
        'entity_id',
        'module',
        'product_id',
        'product_name',
        'product_code',
        'product_source',
        'quantity',
        'discount_percentage',
        'tax_rate',
        'unit_price_in_home_currency',
        'unit_price_in_deal_currency',
        'total_price_in_home_currency',
        'total_price_in_deal_currency',
        'description',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'created_at'          => 'siteTimeZone',
        'updated_at'          => 'siteTimeZone',
        'quantity'            => 'int',
        'discount_percentage' => 'float',
        'tax_rate'            => 'float',
    ];

    protected function castToSiteTimeZone($value)
    {
        return get_date_from_gmt($value);
    }
}
