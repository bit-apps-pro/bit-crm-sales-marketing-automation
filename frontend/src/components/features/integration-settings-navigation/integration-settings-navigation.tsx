import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { Button, Tooltip } from 'antd'
import { LuSquareArrowUpRight } from 'react-icons/lu'
import { Link } from 'react-router'

interface IntegrationSettingsNavigationProps {
  capability?: string
  label: string
  to: string
  tooltip: string
}

export default function IntegrationSettingsNavigation({
  capability = CAPABILITIES.SETTING.INTEGRATION,
  label,
  to,
  tooltip
}: IntegrationSettingsNavigationProps) {
  if (!checkCapability(capability)) return

  return (
    <Tooltip title={tooltip}>
      <Link to={to}>
        {/* Below `sm` the page header wraps its actions onto their own row, and this link
            only fits beside the Import | Export group once it drops the icon and most of
            the button padding; at full size it takes a row of its own. */}
        <Button
          className="rounded-full text-sm font-normal text-gray-500 max-sm:!px-1 max-sm:!text-[11px] dark:text-gray-400"
          type="text"
        >
          <span className="inline-flex items-center gap-1">
            {label}
            <LuSquareArrowUpRight className="max-sm:hidden" size={14} />
          </span>
        </Button>
      </Link>
    </Tooltip>
  )
}
