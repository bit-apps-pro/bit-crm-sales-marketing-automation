import { motion } from 'framer-motion'
import { type CSSProperties, type ReactNode, useId } from 'react'

interface AnimateHeightPropsType {
  children: ReactNode
  className?: string
  style?: CSSProperties
}

export default function AnimateHeight({ children, className, style }: AnimateHeightPropsType) {
  const id = useId()
  return (
    <motion.div
      animate={{ height: 'auto', opacity: 1, scale: 1 }}
      className={className}
      exit={{ height: 0, opacity: 0, scale: 0.95 }}
      initial={{ height: 0, opacity: 0, scale: 0.95 }}
      key={id}
      style={{ ...style }}
      transition={{
        height: { duration: 0.3 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 }
      }}
    >
      {children}
    </motion.div>
  )
}
