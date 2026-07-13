import { __ } from '@common/helpers/i18nWrap'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import Input from './Input'

describe('test Input component', () => {
  afterEach(cleanup)

  it('should render Input with title', () => {
    render(<Input label={__('Tag name')} />)
    const inputElm = screen.getByText(__('Tag name'))
    expect(inputElm.textContent).toBe(__('Tag name'))
  })
  it('should render Input without title', () => {
    render(<Input />)
    const inputElm = screen.queryByText(__('tag name'))
    // eslint-disable-next-line unicorn/no-null
    expect(inputElm).toBe(null)
  })
  it('should render Invalid message', () => {
    render(<Input invalidMessage={__('Invalid message')} status="error" />)
    const inputElm = screen.getByText(__('Invalid message'))
    expect(inputElm.textContent).toBe(__('Invalid message'))
  })
  it('should render with placeholder', () => {
    render(<Input placeholder={__('Write tag name')} />)
    const inputElm = screen.getByPlaceholderText(__('Write tag name'))
    expect(inputElm.nodeName).toBe('INPUT')
  })
  it('should render with value', () => {
    render(<Input value={__('This is value')} />)
    const inputElm = screen.getByDisplayValue(__('This is value'))
    expect(inputElm).toBeTruthy()
  })
})
