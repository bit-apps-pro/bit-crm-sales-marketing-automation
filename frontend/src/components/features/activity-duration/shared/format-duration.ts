import { __, sprintf } from '@common/helpers/i18nWrap'

/** A meeting or call without a stored duration lasts this long (as on the server). */
export const DEFAULT_DURATION_MINUTES = 30

/** 15 -> "15 min", 60 -> "1 h", 90 -> "1 h 30 min". */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60

  if (hours === 0) {
    return sprintf(__('%d min'), rest)
  }

  // Two single-placeholder pieces: the i18n fallback in i18nWrap cannot
  // read positional placeholders such as %1$d.
  const hoursLabel = sprintf(__('%d h'), hours)

  return rest === 0 ? hoursLabel : `${hoursLabel} ${sprintf(__('%d min'), rest)}`
}
