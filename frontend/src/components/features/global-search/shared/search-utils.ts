import { type NavigationEntry, type ScopeOption } from './types'

const MIN_RECORD_TERM_LENGTH = 2

export const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent)

export const MOD_KEY_LABEL = IS_MAC ? '⌘' : 'Ctrl'

const normalize = (value: string) => value.toLowerCase().trim()

/** `../leads` and `../settings/x` are relative to the header; the modal navigates absolutely. */
export const toAbsolutePath = (path: string) => '/' + path.replace(/^(\.\.\/|\/)+/, '')

export const isRecordTerm = (term: string) => term.trim().length >= MIN_RECORD_TERM_LENGTH

/**
 * Pages whose label, group or keywords contain every word of the query, best first:
 * a label that starts with the query, then one that contains it, then any other match.
 */
export function matchNavigationEntries(entries: NavigationEntry[], query: string, limit = 6) {
  const words = normalize(query).split(/\s+/).filter(Boolean)
  if (words.length === 0) return []

  const phrase = words.join(' ')

  return entries
    .map(entry => {
      const label = normalize(entry.label)
      const haystack = `${label} ${normalize(entry.group)} ${normalize(entry.keywords ?? '')}`
      if (!words.every(word => haystack.includes(word))) return

      const rank = label.startsWith(phrase) ? 0 : label.includes(phrase) ? 1 : 2
      return { entry, rank }
    })
    .filter(match => match !== undefined)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, limit)
    .map(match => match.entry)
}

/** A query beginning with `/` lists the scopes it could name instead of searching. */
export function matchScopeCommand(scopes: ScopeOption[], query: string) {
  if (!query.startsWith('/')) return

  const name = normalize(query.slice(1))
  return scopes.filter(scope => normalize(scope.label).startsWith(name) || scope.key.startsWith(name))
}

/** Splits `text` around case-insensitive occurrences of `term`, for highlighting. */
export function splitByMatch(text: string, term: string) {
  const needle = normalize(term)
  if (!needle || !text) return [{ match: false, text }]

  const parts: { match: boolean; text: string }[] = []
  const lower = text.toLowerCase()
  let cursor = 0

  for (let index = lower.indexOf(needle); index !== -1; index = lower.indexOf(needle, cursor)) {
    if (index > cursor) parts.push({ match: false, text: text.slice(cursor, index) })
    parts.push({ match: true, text: text.slice(index, index + needle.length) })
    cursor = index + needle.length
  }

  if (cursor < text.length) parts.push({ match: false, text: text.slice(cursor) })
  return parts
}
