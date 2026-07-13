import { __ } from '@common/helpers/i18nWrap'
import { type TopProduct } from '@pages/dashboard/shared/types'
import LockedOverlay from '@utilities/pro-feature-alert/internal/locked-overlay'
import { Button, Empty, Typography } from 'antd'
import { type FC } from 'react'

import DashboardCard from '../dashboard-card'

const TopProducts: FC<{ topProductsByQuantity: TopProduct[] }> = () => {
  return (
    <DashboardCard>
      <LockedOverlay className="min-h-[240px]" featureName={__('Top Products')} showIcon={false}>
        <div>
          <div className="flex items-center justify-between">
            <Typography.Title className="mb-0" level={3}>
              {__('Top Products')}
            </Typography.Title>
            <Button className="px-0" size="small">
              {__('View all')}
            </Button>
          </div>
          <Typography.Text className="mb-4 text-[#9090A8]">
            {__('Your best selling products')}
          </Typography.Text>
          <Empty description={__('No products are added')} />
        </div>
      </LockedOverlay>
    </DashboardCard>
  )
}

export default TopProducts
