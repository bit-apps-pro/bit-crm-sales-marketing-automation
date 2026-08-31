export const TAX = {
  EXCLUSIVE: 'exclusive',
  INCLUSIVE: 'inclusive',
  NO_TAX: 'no_tax'
} as const

export const PRODUCT_SOURCE = {
  CUSTOM: 'custom',
  FLUENT_CART: 'fluent_cart_product',
  LOCAL: 'product',
  WOO_COMMERCE: 'woo_commerce_product'
} as const

/**
 * Sources that return products as a parent/variant tree instead of a flat list.
 * These render in a TreeSelect, where only the leaf variants are selectable.
 */
export const VARIANT_TREE_SOURCES: string[] = [PRODUCT_SOURCE.FLUENT_CART, PRODUCT_SOURCE.WOO_COMMERCE]
