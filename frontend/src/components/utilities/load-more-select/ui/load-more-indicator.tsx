import styles from './load-more-indicator.module.css'

interface LoadMoreIndicatorProps {
  loading: boolean
}

export default function LoadMoreIndicator({ loading }: LoadMoreIndicatorProps) {
  return (
    <div className="flex h-2 w-full items-center px-6">
      <div>{loading && <div className={styles.loader} />}</div>
    </div>
  )
}
