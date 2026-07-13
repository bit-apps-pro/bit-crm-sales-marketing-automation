import { useCallback, useEffect, useRef } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function useThrottle<T extends (...args: any[]) => any>(callback: T, delay = 200): T {
  const isThrottled = useRef<boolean>(false)
  const timeoutRef = useRef<null | ReturnType<typeof setTimeout>>(null)
  const lastArgsRef = useRef<Parameters<T> | undefined>(undefined)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return useCallback(
    ((...args: Parameters<T>) => {
      const preservedArgs = args.map(arg => {
        if (arg && typeof arg === 'object') {
          return { ...arg }
        }
        return arg
      }) as Parameters<T>

      lastArgsRef.current = preservedArgs

      if (!isThrottled.current) {
        callback(...args)
        isThrottled.current = true
        lastArgsRef.current = undefined

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(() => {
          isThrottled.current = false
          if (lastArgsRef.current) {
            callback(...lastArgsRef.current)
            lastArgsRef.current = undefined
          }
        }, delay)
      }
    }) as T,
    [callback, delay]
  )
}
