import { __ } from '@common/helpers/i18nWrap'
import youtubeLogo from '@resource/img/youtube-logo.png'
import { Button, Typography } from 'antd'
import { LuArrowUpRight } from 'react-icons/lu'

import DashboardCard from './dashboard-card'

export default function Tutorial() {
  return (
    <DashboardCard className="overflow-hidden">
      <div className="flex flex-col gap-5 2xl:flex-row 2xl:items-center 2xl:justify-between">
        <div className="contents 2xl:block 2xl:min-w-0 2xl:space-y-4">
          <div className="min-w-0">
            <Typography.Title className="mb-0 break-words !text-xl" level={3}>
              {__('Need Help?')}
            </Typography.Title>
            <Typography.Text className="mb-0 block break-words text-[#9090A8]">
              {__('Watch tutorial for a quick start.')}
            </Typography.Text>
          </div>
          <div className="order-3 2xl:order-none">
            <Button
              className="w-full justify-center rounded-full border-none bg-[#FFEFEF] text-[#FF0000] hover:bg-[#FF0000] hover:!text-white 2xl:w-auto"
              icon={<LuArrowUpRight />}
            >
              {__('Watch Tutorials')}
            </Button>
          </div>
        </div>
        <div className="order-2 flex shrink-0 items-center justify-center 2xl:order-none">
          <img
            alt="YouTube"
            className="h-16 w-16 sm:h-20 sm:w-20 lg:h-16 lg:w-16 2xl:h-20 2xl:w-20"
            src={youtubeLogo}
          />
        </div>
      </div>
    </DashboardCard>
  )
}
