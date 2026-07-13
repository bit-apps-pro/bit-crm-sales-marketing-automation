import { AnimatePresence, motion } from 'framer-motion'

interface PropsTypes {
  children: JSX.Element | string
  duration?: number | undefined
  initialDelay?: number | undefined
  is: boolean
}

export default function Fade({ children, duration = 0.3, initialDelay = 0, is }: PropsTypes) {
  const variants = {
    exit: { opacity: 0, transition: { duration } },
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        delay: initialDelay
      }
    }
  }

  return (
    <AnimatePresence>
      {is && (
        <motion.div
          animate="visible"
          exit="exit"
          initial="hidden"
          style={{ display: 'inline-flex' }}
          variants={variants}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
