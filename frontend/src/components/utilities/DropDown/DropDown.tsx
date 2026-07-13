import Tippy from '@tippyjs/react'
// import 'tippy.js/dist/tippy.css'
import { type ReactNode } from 'react'
import { useState } from 'react'
import { roundArrow } from 'tippy.js'
import 'tippy.js/animations/shift-away.css'
import 'tippy.js/dist/svg-arrow.css'

import css from './DropDown.module.css'

// import './static/TippyLightTheme.css'

interface DropdownPropsTypes {
  btnClassName?: string
  children: ReactNode[]
}

export default function DropDown({
  btnClassName = css.dropDownBtn,
  children
}: DropdownPropsTypes): JSX.Element {
  const [visibleDropDown, setVisibleDropDown] = useState(false)

  return (
    <Tippy
      allowHTML
      animation="shift-away"
      // className="dropDownTippy"
      appendTo="parent"
      arrow={roundArrow}
      content={children[1]}
      css={({ token }) => ({
        '& .tippy-svg-arrow': {
          fill: token.colorBgContainer,
          stroke: token.controlOutline
        },
        backgroundColor: token.colorBgElevated,
        borderRadius: token.borderRadius + 1,
        boxShadow: token.boxShadowSecondary
      })}
      inertia
      interactive
      onClickOutside={() => setVisibleDropDown(false)}
      placement="bottom"
      theme="light"
      visible={visibleDropDown}
    >
      <button className={btnClassName} onClick={() => setVisibleDropDown(prv => !prv)} type="button">
        {children[0]}
      </button>
    </Tippy>
  )
}
