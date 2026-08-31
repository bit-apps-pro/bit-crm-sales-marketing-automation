import { type ToolbarConfig } from 'quill/modules/toolbar'

export const MINIMAL_TOOLBAR_CONFIG: ToolbarConfig = [
  ['bold', 'italic', 'underline', 'strike'],
  [{ color: [] }, { background: [] }],
  ['blockquote'],
  [{ list: 'ordered' }, { list: 'bullet' }]
]

export const FULL_TOOLBAR_CONFIG: ToolbarConfig = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ color: [] }, { background: [] }],
  [{ align: [] }],
  ['blockquote'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['link'],
  ['image'],
  ['clean']
]
