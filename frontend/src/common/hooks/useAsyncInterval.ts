import { useEffect, useRef, useState } from 'react'

type UseIntervalType = [boolean, () => void, () => void]

export default function useAsyncInterval(
  callback: () => void,
  delay: number | undefined,
  immediate = false
): UseIntervalType {
  const [timer, setTimer] = useState(immediate ? delay : undefined)
  const savedCallback = useRef(callback)
  const asyncIntervalsRef = useRef<{ id: NodeJS.Timeout | number; run: boolean }[]>([])
  const intervalIndexRef = useRef<number>(0)
  const isRunning = timer !== undefined

  const clearAsyncInterval = (intervalIndex: number) => {
    setTimer(undefined)
    const currentInterval = asyncIntervalsRef.current[intervalIndex]
    if (currentInterval.run) {
      clearTimeout(currentInterval.id)
      currentInterval.run = false
    }
  }

  const runAsyncInterval = async (intervalIndex: number) => {
    await savedCallback.current()

    if (typeof timer !== 'number') return
    const currentInterval = asyncIntervalsRef.current[intervalIndex]
    if (currentInterval.run) {
      currentInterval.id = setTimeout(() => runAsyncInterval(intervalIndex), timer)
    }
  }

  const startInterval = () => setTimer(delay)
  const stopInterval = () => clearAsyncInterval(intervalIndexRef.current)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (typeof timer !== 'number') return

    const intervalIndex = asyncIntervalsRef.current.length
    asyncIntervalsRef.current.push({ id: 0, run: true })
    runAsyncInterval(intervalIndex)
    intervalIndexRef.current = intervalIndex

    return () => clearAsyncInterval(intervalIndexRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer])

  return [isRunning, startInterval, stopInterval]
}
