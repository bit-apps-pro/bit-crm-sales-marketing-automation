import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type FormInstance } from 'antd'
import { create } from 'mutative'
import { useContext } from 'react'

import { type NoteType } from '../shared/note-types'

export default function useSaveNote(form: FormInstance) {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()

  const { data, error, isError, isPending, mutateAsync } = useMutation<
    Response<NoteType>,
    Response<string> | Response<ValidationType<NoteType>>,
    NoteType,
    { previousNotes: Response<NoteType[]> | undefined }
  >({
    mutationFn: (data: NoteType) => queryRequest<NoteType>('notes/store', data),
    mutationKey: ['notes', 'store'],
    onError: (error, newNote: NoteType, context) => {
      if (context?.previousNotes !== undefined) {
        queryClient.setQueryData(['activities', 'notes', newNote.entity_id], context.previousNotes)
      }

      if (typeof error.data === 'object') {
        const errors = Object.entries(error.data).map(([key, messages]) => ({
          errors: messages,
          name: key
        }))
        form.setFields(errors)
        return
      }

      messageApi?.error(error.message || error.data)
    },
    onMutate: async (newNote: NoteType) => {
      if (newNote.module === 'activity') {
        await queryClient.cancelQueries({ queryKey: ['activities', 'notes', newNote.entity_id] })
        const previousNotes = queryClient.getQueryData<Response<NoteType[]>>([
          'activities',
          'notes',
          newNote.entity_id
        ])

        queryClient.setQueryData(
          ['activities', 'notes', newNote.entity_id],
          (prev: Response<NoteType[]> | undefined) => {
            return create(prev, draft => {
              if (draft) {
                draft.data = [{ ...newNote, id: Date.now() }, ...(draft.data ?? [])]
              }
            })
          }
        )
        return { previousNotes }
      }
      return { previousNotes: undefined }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      queryClient.invalidateQueries({ queryKey: ['activities'] })
    },
    onSuccess: () => {
      messageApi?.success(__('Note created successfully'))
      queryClient.invalidateQueries({
        queryKey: ['entity-related-lists-count']
      })
    }
  })

  if (isError) {
    console.error(error)
  }

  return {
    isStoringNote: isPending,
    note: data,
    noteStore: mutateAsync
  }
}
