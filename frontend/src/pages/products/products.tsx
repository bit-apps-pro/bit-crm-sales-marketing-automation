import { __ } from '@common/helpers/i18nWrap'
import { ProEntitiesAlert } from '@utilities/pro-feature-alert'

export default function Products() {
  const PRODUCT_COLUMNS = [
    __('Product Name'),
    __('Product Code/SKU'),
    __('Product Type'),
    __('Unit Price'),
    __('Status'),
    __('Actions')
  ]

  return <ProEntitiesAlert columns={PRODUCT_COLUMNS} featureName={__('Products')} />
}
