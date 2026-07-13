import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type FormInstance } from 'antd'
import { create } from 'mutative'
import { useContext } from 'react'

import { type NoteType } from '../shared/note-types'

export default function useUpdateNote(form: FormInstance) {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()

  const { error, isError, isPending, mutateAsync } = useMutation<
    Response<NoteType>,
    Response<string> | Response<ValidationType<NoteType>>,
    NoteType,
    { previousNotes: Response<NoteType[]> | undefined }
  >({
    mutationFn: data => queryRequest('notes/update', data),
    mutationKey: ['notes', 'update'],
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
    onMutate: async (updatedNote: NoteType) => {
      if (updatedNote.module === 'activity') {
        await queryClient.cancelQueries({ queryKey: ['activities', 'notes', updatedNote.entity_id] })
        const previousNotes = queryClient.getQueryData<Response<NoteType[]>>([
          'activities',
          'notes',
          updatedNote.entity_id
        ])
        queryClient.setQueryData(
          ['activities', 'notes', updatedNote.entity_id],
          (prev: Response<NoteType[]> | undefined) => {
            return create(prev, draft => {
              if (draft) {
                const index = draft.data?.findIndex(note => note.id === updatedNote.id)
                if (index !== undefined && index !== -1) {
                  draft.data[index] = updatedNote
                } else {
                  draft.data = [updatedNote, ...(draft.data ?? [])]
                }
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
      queryClient.invalidateQueries({ queryKey: ['activities', 'notes'] })
    },
    onSuccess: () => {
      form.resetFields()
      messageApi?.success(__('Note updated successfully'))
    }
  })

  if (isError) {
    console.error(error)
  }

  return {
    isUpdatingNote: isPending,
    updateNote: mutateAsync
  }
}
