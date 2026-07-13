import { type FieldItem } from '@common/types/types'
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

const useRelatedEntityTableFieldsStore = create<FieldStore>(set => ({
  actions: {
    setFieldList: (updater: ((prevState: FieldItem[]) => FieldItem[]) | FieldItem[]) =>
      set(state => ({
        fieldList: typeof updater === 'function' ? updater(state.fieldList) : updater
      }))
  },
  fieldList: [],
  orders: []
}))

export const useRelatedEntityTableFieldList = () =>
  useRelatedEntityTableFieldsStore(state => state.fieldList)

export const useRelatedEntityTableFieldsOrders = () =>
  useRelatedEntityTableFieldsStore(state => state.orders)

export const useRelatedEntityTableFieldsStoreActions = () =>
  useRelatedEntityTableFieldsStore(state => state.actions)
