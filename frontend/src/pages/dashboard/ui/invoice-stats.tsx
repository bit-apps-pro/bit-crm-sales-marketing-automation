import { getPercentage } from '@common/helpers/globalHelpers'
import { __ } from '@common/helpers/i18nWrap'
import { Button, Empty, Progress, Typography } from 'antd'
import { Link } from 'react-router'

import { type InvoiceData } from '../shared/types'
import DashboardCard from './dashboard-card'

interface InvoiceStatsProps {
  invoiceStatusOverview: InvoiceData[]
}

export default function InvoiceStats({ invoiceStatusOverview }: InvoiceStatsProps) {
  return (
    <DashboardCard>
      <div className="flex items-center justify-between">
        <Typography.Title className="mb-0" level={3}>
          {__('Invoice')}
        </Typography.Title>
        <Link to="/invoices">
          <Button className="px-0" size="small" type="link">
            {__('View all')}
          </Button>
        </Link>
      </div>
      <Typography.Text className="mb-4 text-[#9090A8]">
        {__('Overview of invoice statuses')}
      </Typography.Text>

      {invoiceStatusOverview.length === 0 ? (
        <Empty className="py-8" description={__('No invoices found')} />
      ) : (
        <div className="mt-2 flex flex-col gap-3.5">
          {invoiceStatusOverview.map((item: InvoiceData) => (
            <div className="grid grid-cols-6" key={item.status}>
              <Typography.Title className="col-span-2 text-sm capitalize">
                {item.status}
              </Typography.Title>
              <Progress
                className="col-span-3"
                percent={getPercentage(Number(item.total), Number(item.grand_total))}
                showInfo={false}
                strokeColor="#6E62E5"
              />
              <Typography.Text className="col-span-1 text-right text-sm">{item.total}</Typography.Text>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  )
}
