/**
 * The types the free plugin's assistant surface needs.
 *
 * The free build has no conversation: the summary button puts a request in the
 * command store and the widget opens on the setup notice. So this file carries
 * only what that hand-off is made of — the request turn, what it stands for,
 * and the page it came from. The turn, streaming and usage types the pro
 * conversation adds live with that code and are not part of the free plugin.
 */

export type SummaryModule = 'company' | 'contact' | 'deal' | 'lead' | 'product'

/**
 * What a short user turn stands for. The backend expands it into the full
 * brief for the model, so the transcript shows one readable line rather than
 * the paragraphs of instruction behind it.
 */
export interface ChatIntent {
  entity_id: number
  module: SummaryModule
  name: string
  type: 'summary'
}

export interface UserTurn {
  content: string
  intent?: ChatIntent
  role: 'user'
}

/** The record the assistant was opened from. */
export interface PageContext {
  entity_id: number
  module: string
}
