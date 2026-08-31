import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { __ } from '@common/helpers/i18nWrap'
import { Button, Typography } from 'antd'
import { useNavigate } from 'react-router'

import AssistantIcon from './assistant-icon'

const { Text } = Typography

interface SetupNoticeProps {
  /** Lets the widget close itself once it has handed over to the settings screen. */
  onNavigate?: () => void
}

/**
 * What the panel shows before the assistant can answer anything — no provider
 * and key yet, or, in the free plugin, no assistant at all.
 *
 * The same notice covers both, and deliberately says nothing about editions:
 * the settings screen it points at already answers that question, and answering
 * it here would turn a floating button into an advert.
 */
export default function SetupNotice({ onNavigate }: SetupNoticeProps) {
  const navigate = useNavigate()

  // Everyone who can open the assistant can see this; only a settings user can
  // act on it, so the button is replaced with who to ask for everyone else.
  const canOpenSettings = checkCapability(CAPABILITIES.SETTING.INTEGRATION)

  const openSettings = () => {
    onNavigate?.()
    navigate('/settings/ai-assistant')
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-6 py-8 text-center">
      <span className="text-[#6E62E5]">
        <AssistantIcon size={32} />
      </span>

      <Text className="text-base" strong>
        {__('The assistant is not set up yet')}
      </Text>

      <Text className="text-sm" type="secondary">
        {canOpenSettings
          ? __(
              'Once an AI provider and API key are set up, you can ask about your leads, contacts, companies, deals and invoices right here.'
            )
          : __('Ask a site administrator to set it up under Settings → AI Assistant.')}
      </Text>

      {canOpenSettings && (
        <Button className="mt-1 rounded-full" onClick={openSettings} type="primary">
          {__('Open AI settings')}
        </Button>
      )}
    </div>
  )
}
