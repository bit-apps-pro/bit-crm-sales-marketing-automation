import { __, sprintf } from '@common/helpers/i18nWrap'
import { ColorPicker, Form, Input, InputNumber, Select } from 'antd'
import { type HTMLAttributes, type ReactNode } from 'react'

import { CATEGORY_OPTIONS } from '../shared/constants'
import { type Stage } from '../shared/types'

type InputType = 'color' | 'number' | 'select' | 'text'

interface EditableCellProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode
  dataIndex: string
  editing: boolean
  index: number
  inputType: InputType
  record: Stage
  title: string
}

function normalizeColorValue(value: unknown): string | unknown {
  if (typeof value === 'string') return value

  if (
    value &&
    typeof value === 'object' &&
    'toHexString' in value &&
    typeof value.toHexString === 'function'
  ) {
    return value.toHexString()
  }

  return value
}

const getInputNode = (inputType: InputType, dataIndex: string) => {
  switch (inputType) {
    case 'color': {
      return <ColorPicker className="w-full" format="hex" showText />
    }
    case 'number': {
      return <InputNumber className="w-full" max={100} min={0} />
    }
    case 'select': {
      return <Select className="w-full" options={CATEGORY_OPTIONS} />
    }
    case 'text': {
      if (dataIndex === 'name') {
        return (
          <div className="flex w-full items-center gap-2">
            <Form.Item className="m-0" name="color" normalize={normalizeColorValue} rules={[]}>
              <ColorPicker format="hex" size="middle" />
            </Form.Item>
            <Form.Item
              className="m-0 flex-1"
              name="name"
              rules={[
                {
                  message: __('Please Input Stage Name!'),
                  required: true
                }
              ]}
            >
              <Input className="w-full" />
            </Form.Item>
          </div>
        )
      }

      return <Input className="w-full" />
    }
    default: {
      return <Input className="w-full" />
    }
  }
}

const getNormalizeFunction = (dataIndex: string) => {
  if (dataIndex === 'color') {
    return normalizeColorValue
  }

  return
}

const renderEditingContent = (inputType: InputType, dataIndex: string, title: string) => {
  if (dataIndex === 'name') {
    return getInputNode(inputType, dataIndex)
  }

  return (
    <Form.Item
      className="m-0"
      name={dataIndex}
      normalize={getNormalizeFunction(dataIndex)}
      rules={[{ message: sprintf(__('Please Input %s!'), title), required: true }]}
    >
      {getInputNode(inputType, dataIndex)}
    </Form.Item>
  )
}

export default function StagesTableEditableCell({
  children,
  dataIndex,
  editing,
  inputType,
  title,
  ...restProps
}: EditableCellProps) {
  return (
    <td {...restProps} style={{ ...restProps.style, overflow: 'hidden' }}>
      {editing ? renderEditingContent(inputType, dataIndex, title) : children}
    </td>
  )
}
