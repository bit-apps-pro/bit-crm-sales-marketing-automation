import { __ } from '@common/helpers/i18nWrap'
import { Button, Divider, InputNumber, Select, Space } from 'antd'
import { useState } from 'react'

import { DEFAULT_DURATION_MINUTES, formatDuration } from './shared/format-duration'

const PRESETS = [15, 30, 60]

/** A day, the longest event the calendar sync writes. */
const MAX_MINUTES = 1440

interface ActivityDurationProps {
  onChange?: (minutes: number) => void
  value?: number
}

/**
 * Meeting or call length in minutes: common lengths to pick from, plus any
 * other number of minutes typed under the list. A value outside the presets
 * (typed here, or set by a calendar) is shown as its own option. With
 * nothing set it shows the default, which the server also uses, so the form
 * needs no initial value of its own.
 */
export default function ActivityDuration({ onChange, value }: ActivityDurationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [custom, setCustom] = useState<null | number>()
  const current = value || DEFAULT_DURATION_MINUTES
  const options = [...new Set([current, ...PRESETS])]
    .sort((a, b) => a - b)
    .map(minutes => ({ label: formatDuration(minutes), value: minutes }))

  const applyCustom = () => {
    if (custom) {
      onChange?.(custom)
      setCustom(undefined)
      setIsOpen(false)
    }
  }

  return (
    <Select
      onChange={onChange}
      onOpenChange={setIsOpen}
      open={isOpen}
      options={options}
      popupRender={menu => (
        <>
          {menu}
          <Divider className="my-1" />
          <Space.Compact block className="items-stretch p-1">
            <InputNumber
              className="w-full"
              max={MAX_MINUTES}
              min={1}
              onChange={setCustom}
              onPressEnter={applyCustom}
              placeholder={__('Minutes')}
              precision={0}
              value={custom}
            />
            <Button className="!h-auto" disabled={!custom} onClick={applyCustom}>
              {__('Set')}
            </Button>
          </Space.Compact>
        </>
      )}
      value={current}
    />
  )
}
