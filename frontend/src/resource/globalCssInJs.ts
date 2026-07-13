import { componentsTokenDark, componentsTokenLight } from '@config/theme'
import { type Interpolation, type Theme } from '@emotion/react'

const globalCssInJs = ({ token }: Theme, isDarkTheme: boolean): Interpolation<Theme> => {
  const componentsToken = isDarkTheme ? componentsTokenDark : componentsTokenLight
  // Access component tokens from the imported componentsToken configuration
  const inputActiveBorderColor = componentsToken?.Input?.activeBorderColor || token.colorPrimary
  const inputHoverBorderColor = componentsToken?.Input?.hoverBorderColor || token.colorPrimary
  const selectActiveBorderColor = componentsToken?.Select?.activeBorderColor || token.colorPrimary
  const selectHoverBorderColor = componentsToken?.Select?.hoverBorderColor || token.colorPrimary
  const datePickerActiveBorderColor =
    componentsToken?.DatePicker?.activeBorderColor || token.colorPrimary
  const datePickerHoverBorderColor = componentsToken?.DatePicker?.hoverBorderColor || token.colorPrimary

  return {
    '.ant-input-affix-wrapper-focused:has(.ant-input)': {
      borderColor: `${inputActiveBorderColor}!important`,
      boxShadow: `none !important`,
      outline: `2px solid ${inputActiveBorderColor} !important`,
      transition: 'box-shadow 0s, outline .2s cubic-bezier(0.18, 0.89, 0.32, 1.28) !important'
    },
    '.ant-input-borderless': {
      border: `1px solid transparent !important`
    },
    '.ant-input:not(:has(~ .ant-input-suffix))': {
      '&:focus': {
        borderColor: `${inputActiveBorderColor}!important`,
        boxShadow: `none !important`,
        outline: `2px solid ${inputActiveBorderColor} !important`
      },
      '&:hover': {
        borderColor: `${inputHoverBorderColor}!important`
      },
      transition: 'box-shadow 0s, outline .2s cubic-bezier(0.18, 0.89, 0.32, 1.28) !important'
    },
    '.ant-picker': {
      '&:hover': {
        borderColor: `${datePickerHoverBorderColor}!important`
      }
    },
    '.ant-picker-focused': {
      borderColor: `${datePickerActiveBorderColor}!important`,
      boxShadow: `none !important`,
      outline: `2px solid ${datePickerActiveBorderColor} !important`,
      transition: 'box-shadow 0s, outline .2s cubic-bezier(0.18, 0.89, 0.32, 1.28) !important'
    },
    '.ant-popover code': {
      backgroundColor: token.colorBgTextActive,
      border: `1px solid ${token.colorBorder}`,
      borderRadius: '4px',
      fontSize: '.75rem',
      margin: '0 2px',
      padding: '.1875rem .25rem'
    },
    '.ant-select-focused .ant-select-selector': {
      borderColor: `${selectActiveBorderColor}!important`,
      boxShadow: `none !important`,
      outline: `2px solid ${selectActiveBorderColor} !important`,
      transition: 'box-shadow 0s, outline .2s cubic-bezier(0.18, 0.89, 0.32, 1.28) !important'
    },
    '.ant-select-selector': {
      '&:hover': {
        borderColor: `${selectHoverBorderColor}!important`
      }
    },

    '.mi-paragraph': { fontSize: '14px', lineHeight: '1.9 !important', margin: '0', minHeight: '27px' },
    '.mix-input p.is-editor-empty:not(:has([data-type=tag]:first-of-type)):before': {
      color: '#adb5bd',
      content: 'attr(data-placeholder)',
      cssFloat: 'left',
      height: '0',
      pointerEvents: 'none'
    },
    '.mix-tag': {
      backgroundColor: '#f3f3f3',
      border: '1px solid #ccc',
      borderRadius: '7px',
      cursor: 'pointer',
      fontWeight: '600 !important',
      marginInline: '3px',
      padding: '2px 3px',
      whiteSpace: 'nowrap'
    },
    // mix input styles
    '.mix-tag-input': {
      '&:focus': {
        border: `1px solid ${token.colorPrimary}`,
        outline: `2px solid ${token.colorPrimary}`
      },
      '&:hover': { border: `1px solid ${token.colorPrimary}` },
      '&.mix-tag-input-error': {
        borderColor: token.colorError,
        outlineColor: token.colorError
      },
      border: '1px solid #ccc',
      borderRadius: '10px',
      display: 'block',
      fontSize: '1rem',
      minHeight: '27px',
      outline: '2px solid transparent',
      padding: '0.11rem 11px',
      transition: 'outline-color 0.2s ease-in-out'
    }
  }
}

export default globalCssInJs
