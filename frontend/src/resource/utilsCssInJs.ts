import { type Interpolation, type Theme } from '@emotion/react'
import { type GlobalToken } from 'antd'

const styleMap = {
  ai: 'alignItems',
  b: 'bottom',
  bdr: 'border',
  bdrclr: 'borderColor',
  bg: 'backgroundColor',
  brs: 'borderRadius',
  clr: 'color',
  cur: 'cursor',
  d: 'display',
  dir: 'flexDirection',
  dis: 'display',
  fs: 'fontSize',
  gp: 'gap',
  h: 'height',
  jc: 'justifyContent',
  l: 'left',
  m: 'margin',
  mb: 'marginBottom',
  ml: 'marginLeft',
  mnh: 'minHeight',
  mnw: 'minWidth',
  mr: 'marginRight',
  mt: 'marginTop',
  mx: 'marginInline',
  mxh: 'maxHeight',
  mxw: 'maxWidth',
  my: 'marginBlock',
  p: 'padding',
  pb: 'paddingBottom',
  pl: 'paddingLeft',
  pos: 'position',
  pr: 'paddingRight',
  pt: 'paddingTop',
  px: 'paddingInline',
  py: 'paddingBlock',
  r: 'right',
  sdw: 'boxShadow',
  ta: 'textAlign',
  top: 'top',
  w: 'width',
  z: 'zIndex'
} as const

type ShortProp = keyof typeof styleMap

type StyleMapValue = (typeof styleMap)[keyof typeof styleMap]

type StyleObjValue = false | keyof GlobalToken | number | string | undefined

type StyleObj = Partial<Record<ShortProp, StyleObjValue>>

type GeneratedStyles = Partial<Record<StyleMapValue, string>>

const ut =
  (styleObj: StyleObj) =>
  ({ token }: { token: GlobalToken }) => {
    const generatedStyles: GeneratedStyles = {}
    const props = Object.keys(styleObj)

    for (const prop_ of props) {
      const prop = prop_ as ShortProp
      if (prop && styleMap[prop] && styleObj[prop]) {
        const fullProp = styleMap[prop]
        const value = parseValue(styleMap[prop], styleObj[prop], token)
        generatedStyles[fullProp] = value
      }
    }

    return generatedStyles as Interpolation<Theme>
  }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseValue(property: string, value: StyleObjValue, tokens: any): string {
  if (value === undefined || value === null) {
    return 'unknown'
  }
  if (property === 'zIndex' && typeof value === 'number') {
    return value.toString()
  }
  let updateValue = value

  if (value && tokens && tokens[value]) {
    updateValue = tokens[value]
  }
  if (typeof updateValue === 'number') {
    updateValue = `${updateValue}px`
  }
  if (typeof value === 'string' && value.endsWith('*')) {
    updateValue = `${value.replace('*', '')}!important`
  }
  return updateValue.toString()
}

export default ut
