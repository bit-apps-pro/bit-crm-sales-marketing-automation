import { DATE_FORMAT, DATE_TIME_FORMAT, phpToDayjsFormat, TIME_FORMAT } from '@config/date-format'
import { format as wpFormat } from '@wordpress/date'
import dayjs from 'dayjs'
import '@config/dayjs-setup'
import { describe, expect, it } from 'vitest'

describe('phpToDayjsFormat', () => {
  it.each([
    // The five presets WordPress offers in Settings → General.
    ['F j, Y', 'MMMM D, YYYY'],
    ['Y-m-d', 'YYYY-MM-DD'],
    ['m/d/Y', 'MM/DD/YYYY'],
    ['d/m/Y', 'DD/MM/YYYY'],
    // The custom format that produced the reported `5.36.Y` bug.
    ['n.j.Y', 'M.D.YYYY'],
    // Time presets.
    ['g:i a', 'h:mm a'],
    ['g:i A', 'h:mm A'],
    ['H:i', 'HH:mm'],
    ['G:i', 'H:mm'],
    // Combined.
    ['F j, Y g:i a', 'MMMM D, YYYY h:mm a'],
    // Weekday names.
    ['l, F jS, Y', 'dddd, MMMM Do, YYYY']
  ])('converts %s', (php, expected) => {
    expect(phpToDayjsFormat(php)).toBe(expected)
  })

  it('treats backslash-escaped characters as literals', () => {
    expect(phpToDayjsFormat(String.raw`\a\t g:i`)).toBe('[a][t] h:mm')
  })

  it('escapes an escaped backslash', () => {
    expect(phpToDayjsFormat(String.raw`Y\\m`)).toBe(String.raw`YYYY\MM`)
  })

  it('escapes alphabetic characters it has no mapping for', () => {
    // `q` is not a PHP date token; passing it through unescaped would let dayjs
    // reinterpret it. Non-alphabetic separators pass through untouched.
    expect(phpToDayjsFormat('q-Y')).toBe('[q]-YYYY')
  })

  it('returns an empty string for empty input', () => {
    expect(phpToDayjsFormat('')).toBe('')
  })
})

describe('round-trip against @wordpress/date', () => {
  // A date whose parts are all unambiguous: month != day, PM, double-digit day.
  const subject = new Date('2026-08-31T15:04:05')

  it.each(['F j, Y', 'Y-m-d', 'm/d/Y', 'd/m/Y', 'n.j.Y', 'l, F jS, Y', 'g:i a', 'H:i', 'F j, Y g:i a'])(
    'dayjs renders %s identically to the WP formatter',
    php => {
      // What a picker will show must equal what the tables already show.
      expect(dayjs(subject).format(phpToDayjsFormat(php))).toBe(wpFormat(php, subject))
    }
  )
})

describe('exported format constants', () => {
  it('falls back to sane defaults when the server variable is absent', () => {
    // test.setup.ts stubs SERVER_VARIABLES without dateFormat/timeFormat.
    expect(DATE_FORMAT).toBe('YYYY-MM-DD')
    expect(TIME_FORMAT).toBe('h:mm a')
    expect(DATE_TIME_FORMAT).toBe('YYYY-MM-DD h:mm a')
  })

  it('produces formats dayjs can round-trip through parsing', () => {
    const rendered = dayjs(new Date('2026-08-31T15:04:05')).format(DATE_TIME_FORMAT)

    expect(dayjs(rendered, DATE_TIME_FORMAT).format(DATE_TIME_FORMAT)).toBe(rendered)
  })
})
