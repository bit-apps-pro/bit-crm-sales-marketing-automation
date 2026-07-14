import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { Button, Tooltip } from 'antd'
import { LuSquareArrowUpRight } from 'react-icons/lu'
import { Link } from 'react-router'

interface IntegrationSettingsNavigationProps {
  label: string
  to: string
  tooltip: string
}

export default function IntegrationSettingsNavigation({
  label,
  to,
  tooltip
}: IntegrationSettingsNavigationProps) {
  if (!checkCapability(CAPABILITIES.SETTING.INTEGRATION)) return

  return (
    <Tooltip title={tooltip}>
      <Link to={to}>
        <Button
          className="rounded-full text-sm font-normal text-gray-500 dark:text-gray-400"
          type="text"
        >
          <span className="inline-flex items-center gap-1">
            {label}
            <LuSquareArrowUpRight size={14} />
          </span>
        </Button>
      </Link>
    </Tooltip>
  )
}
