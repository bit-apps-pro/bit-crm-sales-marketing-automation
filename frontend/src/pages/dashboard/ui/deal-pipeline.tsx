import { CalendarOutlined } from '@ant-design/icons'
import { $appConfig } from '@common/globalStates'
import { unslugify } from '@common/helpers/globalHelpers'
import { __ } from '@common/helpers/i18nWrap'
import { generateCurrencyFormatPreview } from '@pages/currencies/shared/common-functions'
import { DatePicker, Typography } from 'antd'
import {
  BarElement,
  CategoryScale,
  type ChartData,
  Chart as ChartJS,
  type ChartOptions,
  Legend,
  LinearScale,
  Tooltip
} from 'chart.js'
import dayjs, { type Dayjs } from 'dayjs'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import { useSearchParams } from 'react-router'

import { DEAL_PIPELINE_CHART, THEME } from '../shared/constants'
import { type DealPipeline } from '../shared/types'
import DashboardCard from './dashboard-card'

const { RangePicker } = DatePicker

ChartJS.register(BarElement, CategoryScale, LinearScale, Legend, Tooltip)

const {
  BAR_THICKNESS,
  CHART_HEIGHT,
  CHART_PADDING_BOTTOM,
  CHART_PADDING_TOP,
  DATE_FORMAT,
  MIN_BAR_WIDTH,
  X_AXIS_HEIGHT,
  Y_AXIS_WIDTH,
  Y_TICKS
} = DEAL_PIPELINE_CHART

interface DealPipelineProps {
  dealPipeline: DealPipeline[]
}

export default function DealPipeline({ dealPipeline }: DealPipelineProps) {
  const { isDarkTheme } = useAtomValue($appConfig)
  const colors = isDarkTheme ? THEME.dark : THEME.light
  const [searchParams, setSearchParams] = useSearchParams()
  const { homeCurrencyData } = useAtomValue($appConfig)

  // Keep the picker controlled by the URL so it reflects the active range (e.g.
  // on reload or deep-link) and stays in sync with the data the parent fetches.
  const defaultStart = useMemo(() => dayjs().startOf('month'), [])
  const defaultEnd = useMemo(() => dayjs(), [])

  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  const rangeValue = useMemo<[Dayjs, Dayjs]>(() => {
    const parsedStart = startDate ? dayjs(startDate) : defaultStart
    const parsedEnd = endDate ? dayjs(endDate) : defaultEnd

    return [
      parsedStart.isValid() ? parsedStart : defaultStart,
      parsedEnd.isValid() ? parsedEnd : defaultEnd
    ]
  }, [defaultEnd, defaultStart, endDate, startDate])

  const handleRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (!dates?.[0] || !dates[1] || !dates[0].isValid() || !dates[1].isValid()) {
      return
    }

    setSearchParams(
      prev => {
        prev.set('startDate', dates[0]!.format(DATE_FORMAT))
        prev.set('endDate', dates[1]!.format(DATE_FORMAT))
        return prev
      },
      { replace: true }
    )
  }

  const maxCount = useMemo(
    () => Math.max(1, ...dealPipeline.map(stage => Number(stage.count) || 0)),
    [dealPipeline]
  )

  const data = useMemo<ChartData<'bar'>>(
    () => ({
      datasets: [
        {
          backgroundColor: '#EFF2FF',
          // Fixed pixel width so bars stay the same thickness regardless of count.
          barThickness: BAR_THICKNESS,
          borderRadius: 14,
          borderSkipped: false,
          // ...and fill with the full stage color on hover. Stages without a
          // configured color keep the neutral bar fill (no color shown).
          hoverBackgroundColor: dealPipeline.map(stage => stage.color ?? '#EFF2FF'),
          // Heights are a percentage of the busiest stage so the y-axis reads 0–100%.
          data: dealPipeline.map(stage => ((Number(stage.count) || 0) / maxCount) * 100)
        }
      ],
      labels: dealPipeline.map(stage => stage.name || unslugify(stage.stage, '_'))
    }),
    [dealPipeline, maxCount]
  )

  const options = useMemo<ChartOptions<'bar'>>(
    () => ({
      animation: { duration: 500 },
      layout: { padding: { bottom: CHART_PADDING_BOTTOM, top: CHART_PADDING_TOP } },
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(58, 53, 84, 0.92)',
          bodyColor: '#D7D5E8',
          bodyFont: { size: 12 },
          boxHeight: 8,
          boxPadding: 6,
          boxWidth: 8,
          callbacks: {
            label: context => {
              const stage = dealPipeline[context.dataIndex]
              const deals = `${stage?.count ?? 0} ${__('deals')}`
              const amount = generateCurrencyFormatPreview(homeCurrencyData, Number(stage?.amount))
              return [deals, amount]
            },
            labelPointStyle: () => ({ pointStyle: 'circle', rotation: 0 }),
            title: items => {
              const stage = dealPipeline[items[0].dataIndex]
              return `${__('Deal')} ${stage?.name || unslugify(stage?.stage ?? '', '_')}`
            }
          },
          cornerRadius: 10,
          displayColors: true,
          enabled: true,
          padding: 12,
          titleColor: '#FFFFFF',
          titleFont: { size: 13, weight: 'bold' },
          usePointStyle: true
        }
      },
      responsive: true,
      scales: {
        x: {
          border: { display: false },
          grid: { display: false },
          ticks: {
            font: { size: 12 },
            padding: 8
          }
        },
        y: {
          afterBuildTicks: axis => {
            // eslint-disable-next-line no-param-reassign
            axis.ticks = Y_TICKS.map(value => ({ value }))
          },
          border: { display: false },
          grid: { color: colors.grid, drawTicks: false, z: -1 },
          max: 100,
          min: 0,
          position: 'left',
          // The y-axis tick labels are drawn by the pinned axis chart on the left;
          // here we keep the gridlines but hide the labels so they don't scroll.
          ticks: { display: false }
        }
      }
    }),
    [colors.grid, dealPipeline, homeCurrencyData]
  )

  return (
    <DashboardCard>
      <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row">
        <div>
          <Typography.Title className="mb-0" level={3}>
            {__('Deal Pipeline')}
          </Typography.Title>
          <Typography.Text className="text-[#9090A8]">
            {__('Track deals across each pipeline stage')}
          </Typography.Text>
        </div>
        <RangePicker
          allowClear={false}
          className="w-64 flex-shrink-0 rounded-full border-[#E5E3FE]"
          format="DD MMM YYYY"
          onChange={handleRangeChange}
          separator="–"
          suffixIcon={<CalendarOutlined className="text-[#9090A8]" />}
          value={rangeValue}
        />
      </div>
      <div className="flex">
        {/* Pinned y-axis: HTML labels that stay put while the bars scroll. The
            label band matches the chart's plot area (top/bottom padding) so each
            value lines up with its gridline. */}
        <div
          className="flex-shrink-0"
          style={{ height: CHART_HEIGHT + X_AXIS_HEIGHT, width: Y_AXIS_WIDTH }}
        >
          <div
            className="flex flex-col items-end justify-between"
            style={{
              height: CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM,
              paddingRight: 4,
              paddingTop: CHART_PADDING_TOP
            }}
          >
            {[...Y_TICKS].reverse().map(tick => (
              <span className="text-xs leading-none text-[#9090A8]" key={tick}>
                {tick}%
              </span>
            ))}
          </div>
        </div>
        {/* Scrolling bars (their own y-axis labels are hidden). */}
        <div className="flex-1 overflow-x-auto">
          <div
            style={{
              height: CHART_HEIGHT + X_AXIS_HEIGHT,
              minWidth: `${dealPipeline.length * MIN_BAR_WIDTH}px`,
              width: '100%'
            }}
          >
            <Bar data={data} options={options} />
          </div>
        </div>
      </div>
    </DashboardCard>
  )
}
