import { useEffect, useRef, useState } from 'react'

type UseIntervalType = [boolean, () => void, () => void]

export default function useInterval(
  callback: () => void,
  delay: null | number,
  immediate = false
): UseIntervalType {
  const [timer, setTimer] = useState(immediate ? delay : undefined)
  const intervalRef = useRef<NodeJS.Timeout>()
  const savedCallback = useRef(callback)
  const isRunning = timer !== null

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (typeof timer === 'number') {
      intervalRef.current = setInterval(savedCallback.current, timer)
    }
    return () => intervalRef.current && clearInterval(intervalRef.current)
  }, [timer])

  const startInterval = () => setTimer(delay)
  const stopInterval = () => setTimer(undefined)

  return [isRunning, startInterval, stopInterval]
}
