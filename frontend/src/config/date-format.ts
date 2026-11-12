import config from '@config/config'
import dayjs, { type Dayjs } from 'dayjs'

/**
 * WordPress stores `date_format`/`time_format` as **PHP** date tokens, but
 * antd's pickers hand their `format` prop to **dayjs**, which speaks an
 * entirely different token language. Passing the raw option through renders
 * garbage — a site set to `n.j.Y` came out as `5.36.Y`, because dayjs matches
 * none of those tokens and leaves `Y` verbatim.
 *
 * Read-only display already avoids this by going through `format()` from
 * `@wordpress/date`, which understands PHP tokens natively. This module is the
 * equivalent bridge for the input side.
 */

/** PHP date token → dayjs token. Tokens absent here are treated as literals. */
const PHP_TO_DAYJS: Record<string, string> = {
  // Day
  d: 'DD', // 01-31
  D: 'ddd', // Mon
  j: 'D', // 1-31
  l: 'dddd', // Monday
  N: 'E', // ISO weekday, 1-7
  w: 'd', // weekday, 0-6
  // Month
  F: 'MMMM', // January
  m: 'MM', // 01-12
  M: 'MMM', // Jan
  n: 'M', // 1-12
  // Year
  o: 'GGGG', // ISO week-year
  Y: 'YYYY', // 2026
  y: 'YY', // 26
  // Time
  A: 'A', // PM
  a: 'a', // pm
  G: 'H', // 0-23
  g: 'h', // 1-12
  H: 'HH', // 00-23
  h: 'hh', // 01-12
  i: 'mm', // 00-59
  s: 'ss', // 00-59
  u: 'SSSSSS', // microseconds
  v: 'SSS', // milliseconds
  // Timezone
  e: 'z',
  O: 'ZZ', // +0600
  P: 'Z', // +06:00
  T: 'z'
}

/** Characters dayjs would otherwise interpret must be escaped as literals. */
const escapeLiteral = (char: string) => (/[A-Za-z]/.test(char) ? `[${char}]` : char)

/**
 * One pass over the format string, matching in priority order:
 *   1. `\x`     - PHP escape, meaning a literal x
 *   2. `jS`/`dS` - day number plus its ordinal suffix
 *   3. any single character
 *
 * Consuming escapes in the same pass keeps `\j` from being mistaken for a
 * token, and matching the ordinal pair before single characters avoids needing
 * a sentinel that a literal in the format could collide with.
 */
const TOKEN = /\\(.)|([jd])S|(.)/gs

/**
 * Converts a PHP date-format string into the dayjs equivalent.
 *
 * Unmapped alphabetic characters are escaped rather than passed through, so an
 * unsupported PHP token degrades to a visible literal instead of silently
 * turning into an unrelated dayjs token.
 */
export function phpToDayjsFormat(phpFormat: string): string {
  if (!phpFormat) return ''

  return phpFormat.replaceAll(TOKEN, (_, escaped: string, ordinalDay: string, char: string) => {
    if (escaped !== undefined) return escapeLiteral(escaped)
    // dayjs has no standalone ordinal token; `Do` carries the number with it
    // and needs the `advancedFormat` plugin (registered in `dayjs-setup`).
    if (ordinalDay !== undefined) return 'Do'

    return PHP_TO_DAYJS[char] ?? escapeLiteral(char)
  })
}

// `Config::getOption('date_format', false, true)` returns `false` when the
// option is missing, which arrives here as an empty string.
const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD'
const DEFAULT_TIME_FORMAT = 'h:mm a'

/** The site's date format, in dayjs tokens. Pass to a picker's `format` prop. */
export const DATE_FORMAT = phpToDayjsFormat(config.DATE_FORMAT) || DEFAULT_DATE_FORMAT

/** The site's time format, in dayjs tokens. */
export const TIME_FORMAT = phpToDayjsFormat(config.TIME_FORMAT) || DEFAULT_TIME_FORMAT

/** For pickers using `showTime`; mirrors `formatDateTime()` in globalHelpers. */
export const DATE_TIME_FORMAT = `${DATE_FORMAT} ${TIME_FORMAT}`

/** The UTC format the API stores dates in. */
const API_DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'

/** WordPress gives an offset ("+06:00") when the site uses one, not a zone name. */
const UTC_OFFSET_PATTERN = /^([+-])(\d{2}):?(\d{2})$/

/**
 * A date and time picked in the site's timezone, as the UTC value the API
 * stores. The CRM shows every date in site time (the API converts on the way
 * out), so a picked 12:00 means 12:00 site time. Sending the picker's value
 * as it is would read it in the browser's timezone instead, and every user
 * whose browser is not in the site's timezone would save, show and sync a
 * different time than they picked.
 *
 * @param timeZone the site's zone name ("Asia/Dhaka") or UTC offset ("+06:00")
 */
export function siteDateTimeToUtc(value: Dayjs, timeZone: string = config.TIME_ZONE): string {
  const wallClock = value.format('YYYY-MM-DDTHH:mm:ss')
  const offsetMinutes = getOffsetMinutes(timeZone)

  if (offsetMinutes !== undefined) {
    return dayjs.utc(wallClock).subtract(offsetMinutes, 'minute').format(API_DATE_TIME_FORMAT)
  }

  try {
    return dayjs
      .tz(wallClock, timeZone || 'UTC')
      .utc()
      .format(API_DATE_TIME_FORMAT)
  } catch {
    // An unknown zone name: treat the time as UTC rather than fail the save.
    return dayjs.utc(wallClock).format(API_DATE_TIME_FORMAT)
  }
}

/**
 * The reverse of siteDateTimeToUtc: a stored UTC value ("2026-11-10
 * 06:00:00" or an ISO string) as the site-time date and time a picker shows.
 */
export function utcToSiteDateTime(value: string, timeZone: string = config.TIME_ZONE): Dayjs {
  const instant = dayjs.utc(value)
  const offsetMinutes = getOffsetMinutes(timeZone)
  let siteTime = instant

  if (offsetMinutes === undefined) {
    try {
      siteTime = instant.tz(timeZone || 'UTC')
    } catch {
      // An unknown zone name: show the time as UTC.
    }
  } else {
    siteTime = instant.add(offsetMinutes, 'minute')
  }

  return dayjs(siteTime.format('YYYY-MM-DDTHH:mm:ss'))
}

/** Minutes east of UTC for an offset like "+06:00"; undefined for a zone name. */
function getOffsetMinutes(timeZone: string): number | undefined {
  const offset = UTC_OFFSET_PATTERN.exec(timeZone ?? '')

  if (!offset) {
    return undefined
  }

  return (Number(offset[2]) * 60 + Number(offset[3])) * (offset[1] === '-' ? -1 : 1)
}
