import { create } from 'zustand'

import { type PageContext, type UserTurn } from '../shared/types'

/**
 * A request for the assistant to open and start a conversation.
 *
 * The widget lives in the layout, far from the record pages that want to hand
 * it a first message, so the hand-off goes through this store: a page calls
 * `handleRequest`, the widget reacts to `command`. `seq` makes every request
 * distinct, so asking for the same thing twice still starts twice.
 */
export interface AiChatCommand {
  context: PageContext
  seq: number
  turn: UserTurn
}

interface AiChatCommandStore {
  command: AiChatCommand | undefined
  handleRequest: (turn: UserTurn, context: PageContext) => void
}

const useAiChatCommandStore = create<AiChatCommandStore>(set => ({
  command: undefined,
  handleRequest: (turn, context) => set({ command: { context, seq: Date.now(), turn } })
}))

export default useAiChatCommandStore
