import CONFIG from '@config/config'

export type DirectionType = 'ltr' | 'rtl'

/**
 * A physical screen side.
 *
 * Distinct from {@link DirectionType}: that one is a writing direction, this is
 * the resolved side an antd prop expects once the direction has been applied.
 */
export type SideType = 'left' | 'right'

/**
 * Text direction for the active WordPress locale.
 *
 * Sourced from `is_rtl()` on the server, so the app follows whatever language
 * the admin selected instead of carrying a setting of its own.
 */
export const direction: DirectionType = CONFIG.IS_RTL ? 'rtl' : 'ltr'

export const isRtl = (): boolean => direction === 'rtl'

/**
 * Side an end-of-screen drawer slides in from.
 *
 * antd's Drawer default is physical `right` and ConfigProvider's direction
 * does not flip it, so RTL layouts have to pick the mirrored side themselves.
 */
export const drawerPlacement: SideType = direction === 'rtl' ? 'left' : 'right'

/**
 * Side a Divider title sits on.
 *
 * antd's Divider `orientation` is physical and ConfigProvider's direction does
 * not flip it, so RTL layouts have to mirror it themselves.
 */
export const dividerOrientation: SideType = direction === 'rtl' ? 'right' : 'left'

/**
 * Mark a mount point with the resolved direction.
 *
 * antd's `ConfigProvider direction` only mirrors antd's own components; CSS
 * logical properties -- what the Tailwind `ms-/me-/ps-/pe-` utilities compile
 * to -- resolve against the DOM's `dir` instead. Setting it here keeps the two
 * in agreement, and inherits to portals mounted under the same element.
 */
export const applyDirection = (element: Element | null | undefined): void => {
  element?.setAttribute('dir', direction)
}
