import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { cn } from '@common/helpers/globalHelpers'
import { __ } from '@common/helpers/i18nWrap'
import { Button, Modal, Typography } from 'antd'
import { type KeyboardEvent, type ReactNode, useEffect, useState } from 'react'
import { LuCheck, LuImport, LuPlus } from 'react-icons/lu'

import useSampleDataPrompt from '../data/use-sample-data-prompt'

type StartChoice = 'sample' | 'scratch'

interface StartOption {
  description: string
  icon: ReactNode
  key: StartChoice
  title: string
}

const OPTIONS: StartOption[] = [
  {
    description: __('Add your own leads, contacts and deals.'),
    icon: <LuPlus size={20} />,
    key: 'scratch',
    title: __('Start from scratch')
  },
  {
    description: __('Explore with ready-made example records.'),
    icon: <LuImport size={20} />,
    key: 'sample',
    title: __('Import sample data')
  }
]

/** Let the screen settle before asking; the offer is not a blocker for the first paint. */
const OPEN_DELAY_MS = 2000

/**
 * One-time choice offered shortly after entering the CRM on a fresh install.
 * Whatever the user picks is stored server-side so the question is never
 * asked again on this install.
 */
export default function SampleDataPromptModal() {
  const [choice, setChoice] = useState<StartChoice>('scratch')
  const [settled, setSettled] = useState(false)
  const { dismiss, isDismissing, isOpen, isSeeding, seed } = useSampleDataPrompt()

  useEffect(() => {
    if (!isOpen) return
    const timer = setTimeout(() => setSettled(true), OPEN_DELAY_MS)
    return () => clearTimeout(timer)
  }, [isOpen])

  const open = settled && isOpen && checkCapability(CAPABILITIES.SETTING.DATA_MANAGEMENT)
  const busy = isSeeding || isDismissing

  const handleContinue = () => {
    if (busy) return
    if (choice === 'scratch') {
      dismiss().catch(() => {
        // The hook already hides the dialog on settle.
      })
      return
    }
    seed().catch(() => {
      // The hook already reports the error; the dialog stays open so the user can retry.
    })
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (['ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp'].includes(event.key)) {
      event.preventDefault()
      setChoice(prev => (prev === 'scratch' ? 'sample' : 'scratch'))
    }
  }

  return (
    <Modal
      centered
      closable={false}
      footer={
        <Button loading={busy} onClick={handleContinue} type="primary">
          {choice === 'sample' ? __('Import & continue') : __('Continue')}
        </Button>
      }
      keyboard={false}
      maskClosable={false}
      open={open}
      title={__('How do you want to start?')}
    >
      <div className="flex flex-col gap-3 py-2">
        <Typography.Text type="secondary">
          {__('Choose how you want to begin. You can change your data anytime.')}
        </Typography.Text>

        <div
          aria-label={__('Starting point')}
          className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2"
          role="radiogroup"
        >
          {OPTIONS.map(option => {
            const selected = option.key === choice

            return (
              <button
                aria-checked={selected}
                className={cn(
                  'relative flex h-full w-full cursor-pointer flex-col gap-3 rounded-[14px] border border-solid bg-transparent p-3 text-start transition',
                  selected ? 'border-primary' : 'border-[#E5E3FE] dark:border-neutral-700'
                )}
                disabled={busy}
                key={option.key}
                onClick={() => setChoice(option.key)}
                onKeyDown={handleKeyDown}
                role="radio"
                tabIndex={selected ? 0 : -1}
                type="button"
              >
                <span className="flex items-start justify-between">
                  <span className="flex size-9 items-center justify-center rounded-md bg-[#EEF0FB] text-primary dark:bg-zinc-800">
                    {option.icon}
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      'flex size-5 items-center justify-center rounded-full bg-primary text-white transition',
                      selected ? 'opacity-100' : 'opacity-0'
                    )}
                  >
                    <LuCheck size={12} strokeWidth={3} />
                  </span>
                </span>

                <span className="min-w-0">
                  <Typography.Text className="block text-sm font-semibold">
                    {option.title}
                  </Typography.Text>
                  <Typography.Text className="block text-xs" type="secondary">
                    {option.description}
                  </Typography.Text>
                </span>
              </button>
            )
          })}
        </div>

        <Typography.Text className="text-xs" type="secondary">
          {__(
            "Sample data is clearly tagged and can be removed anytime from the dashboard. You'll only see this once."
          )}
        </Typography.Text>
      </div>
    </Modal>
  )
}
