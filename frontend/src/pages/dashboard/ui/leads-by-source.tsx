import { unslugify } from '@common/helpers/globalHelpers'
import { __ } from '@common/helpers/i18nWrap'
import { Button, Empty, Typography } from 'antd'
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import { useMemo } from 'react'
import { Doughnut } from 'react-chartjs-2'
import { Link } from 'react-router'

import { type LeadCountBySource } from '../shared/types'
import DashboardCard from './dashboard-card'

ChartJS.register(ArcElement, Legend, Tooltip)

const SOURCE_COLORS = ['#703DD7', '#946EE1', '#B89EEB', '#DBCFF5']

interface LeadCountBySourceProps {
  leadCountBySource: LeadCountBySource[]
}

export default function LeadsBySource({ leadCountBySource }: LeadCountBySourceProps) {
  const data = useMemo(
    () => ({
      datasets: [
        {
          backgroundColor: leadCountBySource.map(
            (_, index) => SOURCE_COLORS[index % SOURCE_COLORS.length]
          ),
          borderRadius: 0,
          borderWidth: 0,
          data: leadCountBySource.map(source => source.total),
          spacing: 0
        }
      ],
      labels: leadCountBySource.map(source => source.lead_source)
    }),
    [leadCountBySource]
  )

  return (
    <DashboardCard>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <Typography.Title className="mb-0" level={3}>
            {__('Leads by Source')}
          </Typography.Title>
          <Typography.Text className="mb-4 text-[#9090A8]">
            {__('Breakdown by acquisition source')}
          </Typography.Text>
        </div>
        <Link to="/leads">
          <Button size="small" type="link">
            {__('View all')}
          </Button>
        </Link>
      </div>
      {leadCountBySource.length === 0 ? (
        <>
          <Empty />
        </>
      ) : (
        <>
          <div className="flex justify-center">
            <div className="h-56 w-56">
              <Doughnut
                data={data}
                options={{
                  cutout: '50%',
                  maintainAspectRatio: true,

                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: context => {
                          const label = unslugify(context.label || '', '_')
                          const value = Number(context.parsed) || 0
                          const total = context.dataset.data.reduce(
                            (sum, current) => sum + Number(current),
                            0
                          )
                          const percent = total ? Math.round((value / total) * 100) : 0
                          return `${label}: ${percent}%`
                        },
                        title: () => ''
                      },
                      displayColors: false,
                      enabled: true
                    }
                  },
                  responsive: true
                }}
              />
            </div>
          </div>
          <div className="mt-5 flex flex-col gap-3">
            {leadCountBySource.map((source, index) => (
              <div className="flex items-center justify-between" key={source.lead_source}>
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-3 rounded-[3px]"
                    style={{ backgroundColor: SOURCE_COLORS[index % SOURCE_COLORS.length] }}
                  />
                  <Typography.Text>{unslugify(source.lead_source, '_')}</Typography.Text>
                </div>
                <Typography.Text>{source.total}</Typography.Text>
              </div>
            ))}
          </div>
        </>
      )}
    </DashboardCard>
  )
}
