import { cn } from '@common/helpers/globalHelpers'
import { __, sprintf } from '@common/helpers/i18nWrap'
import useDebounceState from '@common/hooks/useDebounceState'
import { Button, Input, type InputRef, Modal, Skeleton, Tag } from 'antd'
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import {
  LuArrowRight,
  LuBuilding2,
  LuCalendar,
  LuCornerDownLeft,
  LuFileText,
  LuHandshake,
  LuHistory,
  LuLoader,
  LuMagnet,
  LuPackage,
  LuPhone,
  LuPlus,
  LuScrollText,
  LuSearch,
  LuSettings,
  LuSquareCheck,
  LuStickyNote,
  LuUser,
  LuWorkflow,
  LuX
} from 'react-icons/lu'
import { Link, useHref, useNavigate } from 'react-router'

import useGlobalSearch from '../data/use-global-search'
import cls from '../global-search.module.css'
import {
  isRecordTerm,
  matchNavigationEntries,
  matchScopeCommand,
  MOD_KEY_LABEL,
  splitByMatch
} from '../shared/search-utils'
import { type NavigationEntry, type SearchOption, type SearchScope } from '../shared/types'
import { useGlobalSearchActions, useRecentItems, useRecentTerms } from '../state/use-global-search-store'
import { getCreateActions, getNavigationEntries, getScopeOptions } from './navigation-entries'

const ICONS: Record<string, ReactNode> = {
  action: <LuPlus />,
  call: <LuPhone />,
  company: <LuBuilding2 />,
  contact: <LuUser />,
  deal: <LuHandshake />,
  invoice: <LuScrollText />,
  lead: <LuMagnet />,
  meeting: <LuCalendar />,
  more: <LuArrowRight />,
  note: <LuStickyNote />,
  page: <LuFileText />,
  product: <LuPackage />,
  settings: <LuSettings />,
  task: <LuSquareCheck />,
  term: <LuHistory />,
  workflow: <LuWorkflow />
}

const LISTBOX_ID = 'bit-crm-global-search-listbox'
const optionId = (index: number) => `bit-crm-global-search-option-${index}`

interface Section {
  action?: ReactNode
  dimmed?: boolean
  key: string
  options: SearchOption[]
  title: string
}

interface SearchModalProps {
  onClose: () => void
  open: boolean
}

export default function SearchModal({ onClose, open }: SearchModalProps) {
  const navigate = useNavigate()
  const rootHref = useHref('/')
  const inputRef = useRef<InputRef>(null)
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounceState(query, 250)
  const [scope, setScope] = useState<SearchScope>('all')
  const [activeIndex, setActiveIndex] = useState(0)

  const recentItems = useRecentItems()
  const recentTerms = useRecentTerms()
  const { addRecentItem, addRecentTerm, clearRecent } = useGlobalSearchActions()

  const scopes = useMemo(
    () => [...getScopeOptions(), { key: 'pages' as const, label: __('Pages & Settings') }],
    []
  )
  const scopeLabel = scopes.find(option => option.key === scope)?.label
  const scopeCommand = useMemo(() => matchScopeCommand(scopes, query), [scopes, query])
  const trimmedQuery = query.trim()
  const recordTerm = scopeCommand ? '' : debouncedQuery
  const { groups, isFetching, isStale } = useGlobalSearch(recordTerm, scope, open)

  // Typed but not sent yet: the term is still in its debounce pause.
  const isWaitingForRecords =
    !scopeCommand &&
    scope !== 'pages' &&
    isRecordTerm(trimmedQuery) &&
    trimmedQuery !== debouncedQuery.trim()
  const isLoadingRecords = isWaitingForRecords || isFetching
  // The previous term's results stay on screen, dimmed, until the new ones arrive.
  const showsStaleRecords = groups.length > 0 && (isWaitingForRecords || isStale)

  const sections = useMemo<Section[]>(() => {
    if (scopeCommand) {
      if (scopeCommand.length === 0) return []

      return [
        {
          key: 'scopes',
          options: scopeCommand.map(option => ({
            icon: ICONS[option.key] ?? ICONS.page,
            id: `scope:${option.key}`,
            onSelect: () => {
              setScope(option.key)
              setQuery('')
            },
            title: sprintf(__('Search in %s'), option.label)
          })),
          title: __('Filter by')
        }
      ]
    }

    if (!trimmedQuery) {
      const recentSearches: Section = {
        action: (
          <Button className="h-auto p-0 text-xs" onClick={clearRecent} size="small" type="link">
            {__('Clear')}
          </Button>
        ),
        key: 'recent-terms',
        options: recentTerms.map(term => ({
          icon: ICONS.term,
          id: `term:${term}`,
          onSelect: () => setQuery(term),
          title: term
        })),
        title: __('Recent searches')
      }
      const recentlyOpened: Section = {
        key: 'recent-items',
        options: recentItems.map(item => ({
          groupLabel: item.group,
          icon: ICONS[item.iconKey] ?? ICONS.page,
          iconKey: item.iconKey,
          id: item.id,
          path: item.path,
          subtitle: item.subtitle,
          title: item.title
        })),
        title: __('Recently opened')
      }
      const quickActions: Section = {
        key: 'actions',
        options: getCreateActions().map(entry => ({
          ...toNavigationOption(entry),
          subtitle: undefined
        })),
        title: __('Quick actions')
      }

      return [recentSearches, recentlyOpened, scope === 'all' ? quickActions : undefined].filter(
        (section): section is Section => !!section && section.options.length > 0
      )
    }

    const result: Section[] = []

    if (scope === 'all' || scope === 'pages') {
      const matches = matchNavigationEntries(
        getNavigationEntries(),
        trimmedQuery,
        scope === 'pages' ? 20 : 6
      )
      if (matches.length > 0) {
        result.push({
          key: 'navigation',
          options: matches.map(toNavigationOption),
          title: __('Pages & Settings')
        })
      }
    }

    for (const group of groups) {
      const options: SearchOption[] = group.items.map(item => ({
        groupLabel: group.label,
        icon: ICONS[group.key] ?? ICONS.page,
        iconKey: group.key,
        id: `${group.key}:${item.id}`,
        path: item.path,
        subtitle: item.subtitle,
        title: item.title
      }))

      if (group.listPath && group.total > group.items.length) {
        options.push({
          icon: ICONS.more,
          id: `more:${group.key}`,
          path: group.listPath,
          title: sprintf(__('See all %s %s'), group.total.toLocaleString(), group.label.toLowerCase())
        })
      }

      result.push({ dimmed: showsStaleRecords, key: group.key, options, title: group.label })
    }

    return result
  }, [
    clearRecent,
    groups,
    recentItems,
    recentTerms,
    scope,
    scopeCommand,
    showsStaleRecords,
    trimmedQuery
  ])

  const options = useMemo(() => sections.flatMap(section => section.options), [sections])

  useEffect(() => {
    setActiveIndex(0)
  }, [query, scope, groups])

  useEffect(() => {
    document.querySelector(`#${optionId(activeIndex)}`)?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  /** Records, pages and actions go into "Recently opened"; "See all" links and terms do not. */
  const remember = (option: SearchOption) => {
    if (trimmedQuery) addRecentTerm(trimmedQuery)
    if (!option.iconKey || !option.path) return

    const { groupLabel = '', iconKey, id, path, subtitle, title } = option
    addRecentItem({ group: groupLabel, iconKey, id, path, subtitle, title })
  }

  /** In a new tab the modal stays open, so several results can be opened in a row. */
  const select = (option?: SearchOption, inNewTab = false) => {
    if (!option) return

    if (option.onSelect) {
      option.onSelect()
      inputRef.current?.focus()
      return
    }

    if (!option.path) return
    remember(option)

    if (inNewTab) {
      window.open(rootHref + option.path.replace(/^\//, ''), '_blank', 'noopener')
      return
    }

    navigate(option.path)
    onClose()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (options.length === 0) return

      const step = event.key === 'ArrowDown' ? 1 : -1
      setActiveIndex(index => (index + step + options.length) % options.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      select(options[activeIndex], event.metaKey || event.ctrlKey)
    } else if (event.key === 'Backspace' && query === '' && scope !== 'all') {
      setScope('all')
    }
  }

  let emptyMessage: string | undefined
  if (options.length === 0 && !isLoadingRecords) {
    if (scopeCommand) {
      emptyMessage = sprintf(__('No filter matches “%s”.'), query.slice(1))
    } else if (!trimmedQuery) {
      emptyMessage = __('Search leads, contacts, deals, invoices, settings and more.')
    } else if (scope !== 'pages' && !isRecordTerm(trimmedQuery)) {
      emptyMessage = __('Keep typing to search records.')
    } else {
      emptyMessage = sprintf(__('No results for “%s”.'), trimmedQuery)
    }
  }

  let optionIndex = -1

  return (
    <Modal
      /*
        The query and filter outlive the modal (the header, and so this component, stays
        mounted across pages), so reopening returns to the last search. The text comes back
        selected: typing replaces it, the arrow keys pick up where the user left off.
      */
      afterOpenChange={isOpen => isOpen && inputRef.current?.select()}
      closable={false}
      footer={false}
      onCancel={onClose}
      open={open}
      style={{ top: 80 }}
      styles={{ content: { overflow: 'hidden', padding: 0 } }}
      width={640}
    >
      <div className="flex items-center gap-2 border-0 border-b border-solid border-gray-200 px-3 py-2 dark:border-neutral-700">
        <LuSearch className="ms-2 shrink-0 text-gray-400" size={18} />
        {scope !== 'all' && (
          <Tag
            className="m-0 shrink-0"
            closable
            color="purple"
            onClose={event => {
              event.preventDefault()
              setScope('all')
              inputRef.current?.focus()
            }}
          >
            {scopeLabel}
          </Tag>
        )}
        <Input
          aria-activedescendant={options.length > 0 ? optionId(activeIndex) : undefined}
          aria-autocomplete="list"
          aria-controls={LISTBOX_ID}
          aria-expanded
          aria-label={__('Search')}
          className={cls.searchInput}
          onChange={event => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            scope === 'all'
              ? __('Search records, pages and settings… type / to filter')
              : sprintf(__('Search %s…'), scopeLabel?.toLowerCase() ?? '')
          }
          ref={inputRef}
          role="combobox"
          size="large"
          // Always rendered: antd remounts the input, dropping focus, when a suffix comes and goes.
          suffix={
            <span className="inline-flex w-4">
              {isLoadingRecords && <LuLoader className="animate-spin text-gray-400" size={16} />}
            </span>
          }
          value={query}
          variant="borderless"
        />
        <Button
          aria-label={__('Close')}
          className="shrink-0 text-gray-400"
          icon={<LuX size={18} />}
          onClick={onClose}
          shape="circle"
          type="text"
        />
      </div>

      {!scopeCommand && (
        <div className="flex flex-wrap gap-1 border-0 border-b border-solid border-gray-200 px-4 py-2 dark:border-neutral-700">
          {[{ key: 'all' as const, label: __('All') }, ...scopes].map(option => (
            <Tag.CheckableTag
              checked={scope === option.key}
              className="m-0 shrink-0 rounded-full px-3 py-0.5"
              key={option.key}
              onChange={() => {
                setScope(option.key)
                inputRef.current?.focus()
              }}
            >
              {option.label}
            </Tag.CheckableTag>
          ))}
        </div>
      )}

      <div
        aria-busy={isLoadingRecords}
        aria-label={__('Search results')}
        className="scroller thin max-h-[min(420px,60vh)] overflow-y-auto p-2"
        id={LISTBOX_ID}
        role="listbox"
      >
        {sections.map(section => (
          <div
            aria-labelledby={`${LISTBOX_ID}-${section.key}`}
            className={cn('transition-opacity', section.dimmed && 'opacity-50')}
            key={section.key}
            role="group"
          >
            <div className="flex items-center justify-between px-3 pb-1 pt-2">
              <span
                className="text-xs font-medium uppercase tracking-wide text-gray-400"
                id={`${LISTBOX_ID}-${section.key}`}
              >
                {section.title}
              </span>
              {section.action}
            </div>
            {section.options.map(option => {
              optionIndex += 1
              const index = optionIndex
              const isActive = index === activeIndex

              const rowClassName = cn(
                'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-inherit no-underline shadow-none outline-none hover:text-inherit focus:text-inherit',
                isActive && 'bg-gray-100 dark:bg-white/10'
              )
              const activate = () => index !== activeIndex && setActiveIndex(index)
              const content = (
                <>
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-300">
                    {option.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      <Highlight term={trimmedQuery} text={option.title} />
                    </span>
                    {option.subtitle && (
                      <span className="block truncate text-xs text-gray-500 dark:text-gray-400">
                        <Highlight term={trimmedQuery} text={option.subtitle} />
                      </span>
                    )}
                  </span>
                  {isActive && <LuCornerDownLeft className="shrink-0 text-gray-400" size={14} />}
                </>
              )

              /*
                Results with a destination are router links: middle-click and Ctrl/⌘/Shift+click
                open them in a new tab natively, a plain click navigates in the app. Focus stays in
                the combobox input, which owns the keyboard (aria-activedescendant).
              */
              return option.path ? (
                <Link
                  aria-selected={isActive}
                  className={rowClassName}
                  id={optionId(index)}
                  key={option.id}
                  onAuxClick={() => remember(option)}
                  onClick={event => {
                    remember(option)
                    const isPlainClick =
                      event.button === 0 &&
                      !event.metaKey &&
                      !event.ctrlKey &&
                      !event.shiftKey &&
                      !event.altKey
                    if (isPlainClick) onClose()
                  }}
                  onMouseMove={activate}
                  role="option"
                  tabIndex={-1}
                  to={option.path}
                >
                  {content}
                </Link>
              ) : (
                // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                <div
                  aria-selected={isActive}
                  className={rowClassName}
                  id={optionId(index)}
                  key={option.id}
                  onClick={() => select(option)}
                  onMouseMove={activate}
                  role="option"
                  tabIndex={-1}
                >
                  {content}
                </div>
              )
            })}
          </div>
        ))}

        {isLoadingRecords && groups.length === 0 && <ResultsSkeleton />}

        {emptyMessage && (
          <p className="m-0 px-3 py-8 text-center text-sm text-gray-500">{emptyMessage}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-0 border-t border-solid border-gray-200 px-4 py-2 text-xs text-gray-500 dark:border-neutral-700">
        <span>
          <Kbd>↑</Kbd> <Kbd>↓</Kbd> {__('to navigate')}
        </span>
        <span>
          <Kbd>↵</Kbd> {__('to open')}
        </span>
        <span>
          <Kbd>{MOD_KEY_LABEL}</Kbd> <Kbd>↵</Kbd> {__('new tab')}
        </span>
        <span>
          <Kbd>/</Kbd> {__('to filter')}
        </span>
        <span>
          <Kbd>{__('Esc')}</Kbd> {__('to close')}
        </span>
      </div>
    </Modal>
  )
}

function toNavigationOption(entry: NavigationEntry): SearchOption {
  return {
    groupLabel: entry.group,
    icon: entry.icon,
    // Entry keys are `page:…`, `settings:…` or `action:…`, which are also their icon keys.
    iconKey: entry.key.split(':')[0],
    id: entry.key,
    path: entry.path,
    subtitle: entry.group,
    title: entry.label
  }
}

function Highlight({ term, text }: { term: string; text: string }) {
  return (
    <>
      {splitByMatch(text, term).map((part, index) =>
        part.match ? (
          <mark className="rounded-sm bg-primary/15 p-0 text-inherit" key={index}>
            {part.text}
          </mark>
        ) : (
          <span key={index}>{part.text}</span>
        )
      )}
    </>
  )
}

const SKELETON_ROWS = [
  ['w-3/5', 'w-2/5'],
  ['w-2/5', 'w-1/4'],
  ['w-2/3', 'w-1/3']
]

/** Stand-in rows while records load, laid out like a result so they drop in without a jump. */
function ResultsSkeleton() {
  return (
    <div role="status">
      <div className="px-3 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-gray-400">
        {__('Searching…')}
      </div>
      {SKELETON_ROWS.map(([titleWidth, subtitleWidth]) => (
        <div className="flex items-center gap-3 px-3 py-2" key={titleWidth}>
          <Skeleton.Avatar active shape="square" size={32} />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className={titleWidth}>
              <Skeleton.Input active block size="small" style={{ height: 12 }} />
            </div>
            <div className={subtitleWidth}>
              <Skeleton.Input active block size="small" style={{ height: 10 }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-solid border-gray-300 px-1 font-sans text-[11px] dark:border-neutral-700">
      {children}
    </kbd>
  )
}
