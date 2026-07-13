/* eslint-disable @typescript-eslint/no-explicit-any */

import config from '@config/config'
import { format } from '@wordpress/date'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const select = (selector: string): HTMLElement | null => document.querySelector(selector)

export const assign = (object: any, keyPath: string, value: any) => {
  const lastKeyIndex = keyPath.length - 1

  for (let index = 0; index < lastKeyIndex; ++index) {
    const key = keyPath[index]
    if (!(key in object)) {
      object[key] = {} // eslint-disable-line no-param-reassign
    }
    object = object[key] // eslint-disable-line no-param-reassign
  }
  object[keyPath[lastKeyIndex]] = value // eslint-disable-line no-param-reassign
  return value
}

const forEach = (array: any[], iteratee: any) => {
  let index = -1
  const { length } = array

  while (++index < length) {
    iteratee(array[index], index)
  }
  return array
}

export const deepCopy = (target: any, map = new WeakMap()) => {
  if (typeof target !== 'object' || target === null) {
    return target
  }

  const isArray = Array.isArray(target)
  const cloneTarget: any = isArray ? [] : {}

  if (map.get(target)) {
    return map.get(target)
  }
  map.set(target, cloneTarget)

  if (isArray) {
    forEach(target, (value: any, index: number) => {
      cloneTarget[index] = deepCopy(value, map)
    })
  } else {
    forEach(Object.keys(target), (key: string) => {
      cloneTarget[key] = deepCopy(target[key], map)
    })
  }
  return cloneTarget
}

export const sortArrOfObj = (data: any, sortLabel: string) =>
  data.sort((a: any, b: any) => {
    if (a?.[sortLabel]?.toLowerCase() < b?.[sortLabel]?.toLowerCase()) return -1
    if (a?.[sortLabel]?.toLowerCase() > b?.[sortLabel]?.toLowerCase()) return 1
    return 0
  })

export const dateTimeFormatter = (dateString: string, format: string) => {
  const newDate = new Date(dateString)

  if (newDate.toString() === 'Invalid Date') {
    return 'Invalid Date'
  }

  // Day
  const d = newDate.toLocaleDateString('en-US', { day: '2-digit' })
  const index = newDate.toLocaleDateString('en-US', { day: 'numeric' })
  let S: number | string = Number(index)
  if (S % 10 === 1 && S !== 11) {
    S = 'st'
  } else if (S % 10 === 2 && S !== 12) {
    S = 'nd'
  } else if (S % 10 === 3 && S !== 13) {
    S = 'rd'
  } else {
    S = 'th'
  }
  // Weekday
  const l = newDate.toLocaleDateString('en-US', { weekday: 'long' })
  const D = newDate.toLocaleDateString('en-US', { weekday: 'short' })
  // Month
  const m = newDate.toLocaleDateString('en-US', { month: '2-digit' })
  const n = newDate.toLocaleDateString('en-US', { month: 'numeric' })
  const F = newDate.toLocaleDateString('en-US', { month: 'long' })
  const M = newDate.toLocaleDateString('en-US', { month: 'short' })
  // Year
  const Y = newDate.toLocaleDateString('en-US', { year: 'numeric' })
  const y = newDate.toLocaleDateString('en-US', { year: '2-digit' })
  // Time
  const a = newDate.toLocaleTimeString('en-US', { hour12: true }).split(' ')[1].toLowerCase()
  const A = newDate.toLocaleTimeString('en-US', { hour12: true }).split(' ')[1]
  // Hour
  const g = newDate.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }).split(' ')[0]
  const h = newDate.toLocaleTimeString('en-US', { hour: '2-digit', hour12: true }).split(' ')[0]
  const G = newDate.toLocaleTimeString('en-US', { hour: 'numeric', hour12: false })
  const H = newDate.toLocaleTimeString('en-US', { hour: '2-digit', hour12: false })
  // Minute
  const index_ = newDate.toLocaleTimeString('en-US', { minute: '2-digit' })
  // Second
  const s = newDate.toLocaleTimeString('en-US', { second: '2-digit' })
  // Additional
  const T = newDate.toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ')[2]
  const c = newDate.toISOString()
  const r = newDate.toUTCString()
  const U = newDate.valueOf()
  let formattedDate = ''
  const allFormatObject = {
    a,
    A,
    c,
    d,
    D,
    F,
    g,
    G,
    h,
    H,
    i: index_,
    j: index,
    l,
    m,
    M,
    n,
    r,
    s,
    S,
    T,
    U,
    y,
    Y
  }

  const allFormatkeys = Object.keys(allFormatObject) as (keyof typeof allFormatObject)[]
  for (let v = 0; v < format.length; v += 1) {
    if (format[v] === '\\') {
      v += 1
      formattedDate += format[v]
    } else {
      const formatKey = allFormatkeys.find(key => key === format[v])

      const formatDate = formatKey
        ? format[v].replace(formatKey, String(allFormatObject[formatKey]))
        : format[v]
      formattedDate += formatDate
    }
  }

  return formattedDate
}

// eslint-disable-next-line unicorn/prefer-code-point, unicorn/prefer-spread
const textToChars = (text: string) => text.split('').map(c => c.charCodeAt(0))

const byteHex = (n: number) => {
  const string_ = `0${Number(n).toString(16)}`
  return string_.slice(Math.max(0, string_.length - 2))
}

const cipher = (salt: string) => {
  const applySaltToChar = (code: any) => textToChars(salt).reduce((a: number, b: number) => a ^ b, code)

  return (text: string) => text?.split('')?.map(textToChars).map(applySaltToChar).map(byteHex).join('')
}

const decipher = (salt: string) => {
  const applySaltToChar = (code: any) => textToChars(salt).reduce((a, b) => a ^ b, code)
  return (encoded: string) =>
    encoded
      ?.match(/.{1,2}/g)
      ?.map(hex => Number.parseInt(hex, 16))
      .map(applySaltToChar)
      // eslint-disable-next-line unicorn/prefer-code-point
      .map(charCode => String.fromCharCode(charCode))
      .join('')
}

export const bitCipher = cipher('btcd')
export const bitDecipher = decipher('btcd')

export const checkValidEmail = (email: string) => {
  if (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    return true
  }
  return false
}

export const getColorPreference = () =>
  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches

export const lighten = (color: string | undefined, percentage: number): string => {
  if (!color) return 'transparent'

  const newColor = color.replace('#', '')
  const r = Number.parseInt(newColor.slice(0, 2), 16)
  const g = Number.parseInt(newColor.slice(2, 4), 16)
  const b = Number.parseInt(newColor.slice(4, 6), 16)

  const lightenPercentage = percentage / 100
  const newR = Math.round(r + (255 - r) * lightenPercentage)
  const newG = Math.round(g + (255 - g) * lightenPercentage)
  const newB = Math.round(b + (255 - b) * lightenPercentage)

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB
    .toString(16)
    .padStart(2, '0')}`
}

/**
 * Check if two objects are equal
 *
 * @param obj1 First Object
 * @param obj2 Second Object
 * @returns Boolean
 */
export const isObjectEqual = <T, J>(object1: T, object2: J) =>
  JSON.stringify(object1) === JSON.stringify(object2)

/**
 * Converts a string into a URL-friendly slug.
 *
 * @param text The input string to be slugified.
 * @param separator The character to replace spaces and special characters with (default: '-').
 * @returns The slugified string.
 */
export const slugify = (text: string, separator = '-'): string => {
  return text
    ?.toLowerCase()
    ?.replaceAll(/[^a-z0-9]+/g, separator) // Replace non-alphanumeric with '-'
    ?.replaceAll(/^-+|-+$/g, '') // Trim leading/trailing hyphens
}

/**
 * Converts a slug back into a human-readable string. Reverse of {@link slugify}.
 *
 * Note: this is a best-effort reversal — `slugify` lowercases the input and
 * collapses every non-alphanumeric run into the separator, so the original
 * casing and exact punctuation cannot be recovered. Each separator becomes a
 * space and each word is capitalized.
 *
 * @param slug The slug to be converted back to readable text.
 * @param separator The separator used in the slug (default: '-').
 * @returns The human-readable string.
 */
export const unslugify = (slug: string, separator = '-'): string => {
  return (
    slug
      ?.split(separator)
      ?.filter(Boolean)
      ?.map(word => word.charAt(0).toUpperCase() + word.slice(1))
      ?.join(' ') ?? ''
  )
}

export const showPaginationTotal = (total: number, range: number[]) => {
  return `${range[0]}-${range[1]} of ${total}`
}

export const formatDateTime = (date: Date | string) => {
  return format(`${config.DATE_FORMAT} ${config.TIME_FORMAT}`, new Date(date))
}

export const formatDate = (date: Date | string) => {
  return format(config.DATE_FORMAT, new Date(date))
}

export const formatTime = (date: Date | string) => {
  return format(config.TIME_FORMAT, new Date(date))
}

export function getPercentage(num: number, per: number) {
  if (!num || !(per > 0)) {
    return 0
  }
  return Math.floor((num / per) * 100)
}

/**
 * Combines multiple class names or class condition objects into a single string, merging them using Tailwind CSS utility classes.
 * @param {...ClassValue[]} inputs - Class names, arrays of class names, or objects representing conditional classes to be combined.
 * @returns {string} - Combined class names as a single string.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Formats a file size in bytes into a human-readable string.
 * @param {number} bytes - The file size in bytes.
 * @returns {string} - The formatted file size string.
 */
export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
