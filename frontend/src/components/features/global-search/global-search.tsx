import { memo, useEffect, useState } from 'react'

import SearchModal from './internal/search-modal'
import SearchTrigger from './internal/search-trigger'

const isTypingTarget = (target: HTMLElement) =>
  target.isContentEditable || ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)

function GlobalSearch() {
  const [open, setOpen] = useState(false)

  /*
    Ctrl/⌘+K opens search from anywhere except a rich-text editor, where it is the
    "insert link" shortcut. A bare `/` opens it only when nothing is being typed into,
    so it never swallows a slash in a field.

    WordPress's own command palette (6.9+) binds Ctrl/⌘+K across wp-admin but ignores an
    event whose default is already prevented. Listening in the capture phase gets there
    first, so on CRM screens the shortcut opens CRM search; the palette stays reachable
    from the admin bar.
  */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.isComposing || event.altKey) return

      const target = event.target as HTMLElement
      const isModifierShortcut =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k' && !target.isContentEditable
      const isSlashShortcut =
        event.key === '/' && !event.metaKey && !event.ctrlKey && !isTypingTarget(target)

      if (!isModifierShortcut && !isSlashShortcut) return

      event.preventDefault()
      setOpen(true)
    }

    window.addEventListener('keydown', handleKeyDown, { capture: true })
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true })
  }, [])

  return (
    <>
      <SearchTrigger onClick={() => setOpen(true)} />
      <SearchModal onClose={() => setOpen(false)} open={open} />
    </>
  )
}

// The header re-renders on every URL change (list-page search boxes write the URL per
// keystroke); search has no props, so it need not follow.
export default memo(GlobalSearch)
