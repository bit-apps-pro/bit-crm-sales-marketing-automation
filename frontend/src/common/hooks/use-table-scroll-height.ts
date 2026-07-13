import { useState } from 'react'

import useDebounce from './use-debounce'
import useIsomorphicLayoutEffect from './useIsomorphicLayoutEffect'

const useTableScrollHeight = (offset: number, minHeight = 200) => {
  const [height, setHeight] = useState<number>(0)

  const calculateHeight = () => {
    const windowHeight = window.innerHeight
    const calculatedHeight = windowHeight - offset
    setHeight(Math.max(calculatedHeight, minHeight))
  }

  const debouncedCalculateHeight = useDebounce(calculateHeight, 200)

  useIsomorphicLayoutEffect(() => {
    calculateHeight()
    window.addEventListener('resize', debouncedCalculateHeight)

    return () => {
      window.removeEventListener('resize', debouncedCalculateHeight)
      debouncedCalculateHeight.cancel()
    }
  }, [offset, minHeight])

  return height
}

export default useTableScrollHeight
