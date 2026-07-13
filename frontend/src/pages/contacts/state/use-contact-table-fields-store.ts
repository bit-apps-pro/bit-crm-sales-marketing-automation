import { type FieldItem } from '@features/field-settings/shared/field-types'
import { create } from 'zustand'

interface ItemOrder {
  field_key: string
  order: number
}

interface FieldStore {
  actions: {
    setFieldList: (updater: ((prevState: FieldItem[]) => FieldItem[]) | FieldItem[]) => void
  }
  fieldList: FieldItem[]
  orders: ItemOrder[]
}

const useContactTableFieldsStore = create<FieldStore>(set => ({
  actions: {
    setFieldList: (updater: ((prevState: FieldItem[]) => FieldItem[]) | FieldItem[]) =>
      set(state => ({
        fieldList: typeof updater === 'function' ? updater(state.fieldList) : updater
      }))
  },
  fieldList: [],
  orders: []
}))

export const useContactTableFieldList = () => useContactTableFieldsStore(state => state.fieldList)
export const useContactTableFieldActions = () => useContactTableFieldsStore(state => state.actions)
