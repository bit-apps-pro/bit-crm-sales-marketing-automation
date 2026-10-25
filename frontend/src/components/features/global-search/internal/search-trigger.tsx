import { __ } from '@common/helpers/i18nWrap'
import { Button } from 'antd'
import { LuSearch } from 'react-icons/lu'

import { IS_MAC } from '../shared/search-utils'

const SHORTCUT_LABEL = IS_MAC ? '⌘K' : 'Ctrl K'

interface SearchTriggerProps {
  onClick: () => void
}

/*
  A search-box-shaped pill that advertises its shortcut. Below `xl` the nav pills need
  the room, so the label and key hint drop out and it collapses to a round icon.
*/
export default function SearchTrigger({ onClick }: SearchTriggerProps) {
  return (
    <Button
      aria-keyshortcuts="Control+K Meta+K /"
      aria-label={__('Search')}
      className="h-10 min-w-10 gap-1.5 px-2.5 shadow-none xl:pe-1.5"
      classNames={{ icon: 'flex items-center' }}
      icon={<LuSearch className="text-gray-500" size={18} />}
      onClick={onClick}
      shape="round"
    >
      <span className="hidden pe-1 text-sm text-gray-400 xl:inline">{__('Search…')}</span>
      <kbd className="hidden h-7 items-center rounded-full bg-gray-100 px-2 font-sans text-xs text-gray-500 xl:inline-flex dark:bg-white/10 dark:text-gray-300">
        {SHORTCUT_LABEL}
      </kbd>
    </Button>
  )
}
