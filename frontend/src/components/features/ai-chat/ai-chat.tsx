import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { useEffect, useRef, useState } from 'react'

import ChatShell from './internal/chat-shell'
import SetupNotice from './internal/setup-notice'
import useAiChatCommandStore from './state/use-ai-chat-command-store'

/**
 * Free-plugin stand-in for the AI assistant.
 *
 * The launcher is the same one the pro plugin uses, and opening it lands on the
 * same "not set up yet" notice a pro site sees before it has a key — the panel
 * simply never becomes a conversation here. Nothing in this file, or anything
 * it imports, knows how to talk to a model: the chat itself lives in
 * `ai-chat.pro.tsx` and is tree-shaken out of the free bundle.
 */
export default function AiChat() {
  const [open, setOpen] = useState(false)

  /*
    A record page asking for a summary opens the panel here too, so the person
    lands on the notice rather than on nothing. The request itself is ignored:
    there is no conversation to start it in.
  */
  const { command } = useAiChatCommandStore()
  const handledSeq = useRef(0)

  useEffect(() => {
    if (!command || command.seq === handledSeq.current) return

    handledSeq.current = command.seq
    setOpen(true)
  }, [command])

  /*
    The capability is never granted to a role in the free plugin — it is
    registered by pro — so in practice this is administrators only. That is the
    right audience: they are the only ones who can act on the notice.
  */
  // eslint-disable-next-line unicorn/no-null
  if (!checkCapability(CAPABILITIES.AI.CHAT)) return null

  return (
    <ChatShell onOpenChange={setOpen} open={open} resizable={false}>
      <SetupNotice onNavigate={() => setOpen(false)} />
    </ChatShell>
  )
}
