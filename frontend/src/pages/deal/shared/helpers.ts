import { ARROW_WIDTH } from './constants'

export const getClipPath = (isFirst: boolean, isLast: boolean) => {
  if (isFirst && isLast) {
    return ''
  }
  if (isFirst) {
    return `polygon(0% 0%, calc(100% - ${ARROW_WIDTH}px) 0%, 100% 50%, calc(100% - ${ARROW_WIDTH}px) 100%, 0% 100%)`
  }
  if (isLast) {
    return `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, ${ARROW_WIDTH}px 50%)`
  }
  return `polygon(0% 0%, calc(100% - ${ARROW_WIDTH}px) 0%, 100% 50%, calc(100% - ${ARROW_WIDTH}px) 100%, 0% 100%, ${ARROW_WIDTH}px 50%)`
}
