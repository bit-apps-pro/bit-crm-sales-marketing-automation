import { atom } from 'jotai'

const $paneContextMenu = atom({
  clientX: 0,
  clientY: 0,
  isOpen: false
})
export default $paneContextMenu
