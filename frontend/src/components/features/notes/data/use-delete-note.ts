import NotifyContext from '@common/context/NotifyContext'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { create } from 'mutative'
import { useContext } from 'react'

import { type NoteType } from '../shared/note-types'

interface DeleteNoteVariables {
  entity_id: number | string
  id: number | string
}

export default function useDeleteNote() {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()

  const { isPending, mutateAsync } = useMutation<
    Response<string>,
    Response<string>,
    DeleteNoteVariables,
    { previousNotes: Response<NoteType[]> | undefined }
  >({
    mutationFn: ({ id }) => queryRequest('notes/delete', { id }),
    mutationKey: ['notes', 'delete'],
    onError: (error, { entity_id: entityId }, context) => {
      queryClient.setQueryData(['activities', 'notes', entityId], context?.previousNotes)
      messageApi?.error(error.message || error.data)
    },
    onMutate: async ({ entity_id: entityId, id }) => {
      const queryKey = ['activities', 'notes', entityId]

      await queryClient.cancelQueries({ queryKey })

      const previousNotes = queryClient.getQueryData<Response<NoteType[]>>(queryKey)

      queryClient.setQueryData<Response<NoteType[]>>(queryKey, old => {
        if (!old) return old

        return create(old, draft => {
          draft.data = draft.data.filter(note => note.id !== id)
        })
      })

      return { previousNotes }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      queryClient.invalidateQueries({ queryKey: ['activities'] })
    },
    onSuccess: data => {
      messageApi?.success(data.data)
      queryClient.invalidateQueries({ queryKey: ['entity-related-lists-count'] })
    }
  })

  return {
    deleteNote: mutateAsync,
    isDeletingNote: isPending
  }
}
