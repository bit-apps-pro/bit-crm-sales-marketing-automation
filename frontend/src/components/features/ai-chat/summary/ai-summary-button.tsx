import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { __, sprintf } from '@common/helpers/i18nWrap'
import { Button, Tooltip } from 'antd'

import AssistantIcon from '../internal/assistant-icon'
import { type SummaryModule } from '../shared/types'
import useAiChatCommandStore from '../state/use-ai-chat-command-store'

export interface AiSummaryButtonProps {
  entityId: number | string
  module: SummaryModule
  /** The record's display name, so the request reads naturally in the chat. */
  name: string
}

/**
 * Asks the assistant for a summary of the record on screen.
 *
 * Nothing is generated here: the button opens the assistant and starts a
 * conversation with a one-line request, so the summary arrives the way any
 * other answer does — streamed, with the tools it used visible, and open to
 * follow-up questions. The line carries an intent naming the record; the pro
 * backend expands that into the full brief for the model, so the transcript
 * stays readable.
 *
 * Shown on the same terms as the launcher, in both editions: the capability
 * decides whether this person may use the assistant, and nothing else hides
 * the button. What happens on click is the widget's business — the summary
 * when a provider is configured, otherwise the notice pointing at settings,
 * which is also where the free plugin explains that the assistant is a pro
 * feature. That is why there is no pro variant of this file: it contains
 * nothing a free site could not ship.
 */
export default function AiSummaryButton({ entityId, module, name }: AiSummaryButtonProps) {
  const { handleRequest } = useAiChatCommandStore()

  if (!checkCapability(CAPABILITIES.AI.CHAT)) return <></>

  const id = Number(entityId)
  const label = name.trim() === '' ? `#${id}` : name.trim()

  const ask = () =>
    handleRequest(
      {
        /* translators: %s: the record's name */
        content: sprintf(__('Give me an AI summary of %s.'), label),
        intent: { entity_id: id, module, name: label, type: 'summary' },
        role: 'user'
      },
      { entity_id: id, module }
    )

  return (
    <Tooltip title={__('Ask the AI assistant to summarize this record')}>
      <Button
        className="flex items-center gap-1.5 text-[#6E62E5]"
        icon={<AssistantIcon size={14} />}
        onClick={ask}
      >
        {__('AI Summary')}
      </Button>
    </Tooltip>
  )
}
