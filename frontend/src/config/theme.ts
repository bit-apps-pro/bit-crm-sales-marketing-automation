import { type ThemeConfig } from 'antd'
import { type AliasToken } from 'antd/es/theme/internal'

const fontFamily =
  "'Outfit',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji'"

export const lightThemeConfig: Partial<AliasToken> = {
  borderRadius: 10,
  borderRadiusSM: 8,
  borderRadiusXS: 4,
  boxShadow:
    '0 0 0 1px rgba(0,0,0,0.05), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
  boxShadowSecondary:
    '0 0 0 1px rgba(0,0,0,0.05), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
  colorError: '#ff6264',
  colorInfo: '#051020',
  // colorPrimary: '#ff246d',
  // colorSuccess: '#00ff7d',
  // colorWarning: '#ffc041',
  // colorBgContainer: '#fff',
  // controlOutline: '#48484823',
  colorBgLayout: '#F9FCFF',
  colorBorder: '#E5E3FE',
  colorPrimary: '#703DD7',
  colorPrimaryBg: '#e7edf3',
  // colorPrimaryBorderHover: '#2e2e2e',
  // colorPrimaryHover: '#1a1a1a',
  // colorPrimary: '#000510',
  // colorInfo: '#000510',
  colorSuccess: '#00ff87',
  colorTextBase: '#020d27',
  colorWarning: '#ffb828',
  controlOutline: '#e8e8e8',
  fontFamily,
  motion: true,
  motionDurationSlow: '0.2s',
  zIndexPopupBase: 100_000
}

export const darkThemeConfig = {
  borderRadius: 10,
  borderRadiusSM: 8,
  borderRadiusXS: 4,
  colorError: '#ff6264',
  colorInfo: '#ffffff',
  colorPrimary: '#703DD7',
  colorPrimaryBorderHover: 'red',
  colorPrimaryHover: '#5F2FC4',
  colorSuccess: '#00ff87',
  colorWarning: '#ffb828',
  controlOutline: '#424242',
  fontFamily,
  motion: true,
  motionDurationSlow: '0.2s',
  zIndexPopupBase: 100_000

  // colorBgBase: '#1c1a1e',
  // colorBgBase: '#161218',
  // colorBgBase: '#040304',
  // colorTextBase: '#fce3ff',
  // colorTextBase: '#fef1ff',
  // colorPrimary: '#ff0374',
  // colorPrimary: '#ff246d',
  // colorSuccess: '#00ff7d',
  // colorWarning: '#ffc041'
  // colorBgElevated: 'rgb(28, 21, 28)',
  // colorBgContainer: '#151015',
  // colorBgContainer: '#221E20',
  // colorBgContainer: '#231E27',
  // colorBgContainer: '#2A242F',
  // boxShadow:
  //   '0 0 0 1px rgb(52, 40, 52), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05);',
  // boxShadowSecondary:
  //   '  0 0 0 1px rgb(52, 40, 52),    0 6px 16px 0 rgba(0, 0, 0, 0.08),      0 3px 6px -4px rgba(0, 0, 0, 0.12),      0 9px 28px 8px rgba(0, 0, 0, 0.05)    ',
  // controlOutline: '#ffaace33'
}

export const componentsTokenLight: ThemeConfig['components'] = {
  Checkbox: {
    borderRadiusSM: 4
  },
  DatePicker: {
    activeBorderColor: '#1a1a1a',
    algorithm: true,
    borderRadius: 8,
    colorBorder: '#E5E3FE',
    controlHeight: 40,
    hoverBorderColor: '#404040'
  },
  Input: {
    activeBorderColor: '#1a1a1a',
    algorithm: true,
    borderRadius: 8,
    colorBorder: '#E5E3FE',
    controlHeight: 40,
    hoverBorderColor: '#404040'
  },
  InputNumber: {
    activeBorderColor: '#1a1a1a',
    algorithm: true,
    borderRadius: 8,
    colorBorder: '#E5E3FE',
    controlHeight: 40,
    hoverBorderColor: '#404040'
  },
  Mentions: {
    algorithm: true,
    borderRadius: 8,
    colorBorder: '#E5E3FE',
    controlHeight: 40,
    hoverBorderColor: '#404040'
  },
  Menu: {
    itemSelectedBg: '#703DD7',
    itemSelectedColor: '#fff'
  },
  Select: {
    activeBorderColor: '#1a1a1a',
    algorithm: true,
    borderRadius: 8,
    colorBorder: '#E5E3FE',
    controlHeight: 40,
    hoverBorderColor: '#404040'
  },
  Table: {
    headerBorderRadius: 0
  }
}

export const componentsTokenDark: ThemeConfig['components'] = {
  Checkbox: {
    borderRadiusSM: 4
  },
  DatePicker: {
    algorithm: true,
    borderRadius: 8,
    colorBorder: '#424242',
    controlHeight: 40
  },
  Input: {
    algorithm: true,
    borderRadius: 8,
    colorBorder: '#424242',
    controlHeight: 40
  },
  InputNumber: {
    algorithm: true,
    borderRadius: 8,
    colorBorder: '#424242',
    controlHeight: 40
  },
  Menu: {
    itemSelectedBg: '#703DD7',
    itemSelectedColor: '#fff'
  },
  Select: {
    algorithm: true,
    borderRadius: 8,
    colorBorder: '#424242',
    controlHeight: 40
  },
  Table: {
    headerBorderRadius: 0
  }
}
