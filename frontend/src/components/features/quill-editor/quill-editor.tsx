import 'quill-mention/dist/quill.mention.css'
import { __ } from '@common/helpers/i18nWrap'
import 'quill/dist/quill.snow.css'
import { type WPMediaAttachment } from '@features/wp-media-uploader/wp-media-uploader'
import Quill, { type QuillOptions } from 'quill'
import { Mention, MentionBlot, type MentionOption } from 'quill-mention'
import { AlignStyle } from 'quill/formats/align'
import { type ToolbarConfig } from 'quill/modules/toolbar'
import { useEffect, useLayoutEffect, useRef } from 'react'

Quill.register(AlignStyle, true)

/* Registered explicitly rather than via the `quill-mention/autoregister` side-effect
 * import: the package declares no `sideEffects` field, so a bare import is only kept
 * by bundler convention, and import sorting shuffles its position on every lint pass.
 */
Quill.register({ 'blots/mention': MentionBlot, 'modules/mention': Mention })

/* Browsers serialize inline colors as `rgb(...)`, but `wp_kses_post` rejects any
 * CSS value containing `(` (see safecss_filter_attr; only url/var/calc are carved
 * out). Colors would be silently stripped on save, so rewrite them to hex, which
 * passes kses untouched. Mirrors Quill's own ColorAttributor.value().
 */
const STYLE_ATTRIBUTE_PATTERN = /(\s)style="([^"]*)"/gi
const RGB_COLOR_PATTERN =
  /rgba?\(\s*(\d{1,3})\s*[\s,]\s*(\d{1,3})\s*[\s,]\s*(\d{1,3})\s*(?:[\s,/]+[\d.%]+\s*)?\)/gi

const toHexComponent = (value: string) =>
  `00${Math.min(Number.parseInt(value, 10), 255).toString(16)}`.slice(-2)

export function normalizeRgbColorsToHex(html: string) {
  /* Scoped to real style attributes (preceded by whitespace inside a tag) so
   * that `rgb(...)` typed by the user as plain text, or appearing inside a URL,
   * is left untouched.
   */
  return html.replaceAll(
    STYLE_ATTRIBUTE_PATTERN,
    (_attribute: string, leadingSpace: string, declarations: string) => {
      // Alpha is dropped: kses rejects 8-digit hex and Quill's palette is opaque.
      const hexDeclarations = declarations.replaceAll(
        RGB_COLOR_PATTERN,
        (_match: string, red: string, green: string, blue: string) =>
          `#${toHexComponent(red)}${toHexComponent(green)}${toHexComponent(blue)}`
      )

      return `${leadingSpace}style="${hexDeclarations}"`
    }
  )
}

interface EditorType {
  defaultValue?: string
  includeMention?: boolean
  mentionOptions?: Partial<MentionOption>
  minHeight?: number | string
  onChange?: (html: string) => void
  placeholder?: string
  theme?: 'bubble' | 'snow'
  toolbarConfig?: ToolbarConfig
}

export default function QuillEditor({
  defaultValue,
  includeMention = false,
  mentionOptions,
  minHeight,
  onChange,
  placeholder,
  theme = 'snow',
  toolbarConfig
}: EditorType) {
  const containerRef = useRef<HTMLDivElement>(null)
  const quillRef = useRef<null | Quill | undefined>(null)
  const defaultValueRef = useRef(defaultValue)
  const onChangeRef = useRef(onChange)

  useLayoutEffect(() => {
    onChangeRef.current = onChange
  })

  const imageHandler = () => {
    const mediaFrame = window.wp.media({
      button: { text: __('Attach selected file') },
      library: { type: 'image' },
      multiple: false,
      title: __('Select or Upload Files')
    })

    mediaFrame.on('select', () => {
      const attachments = mediaFrame.state().get('selection').toJSON()
      const quill = quillRef.current
      let index = quill?.getSelection(true)?.index ?? quill?.getLength() ?? 0

      attachments.forEach((attachment: WPMediaAttachment) => {
        quill?.insertEmbed(index, 'image', attachment.url, 'user')
        index += 1
      })

      quill?.setSelection(index)
    })

    mediaFrame.open()
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // eslint-disable-next-line unicorn/prefer-dom-node-append
    const editorContainer = container.appendChild(container.ownerDocument.createElement('div'))

    function setupQuill() {
      const modules: QuillOptions['modules'] = {
        toolbar: {
          container: toolbarConfig,
          handlers: {
            image: imageHandler
          }
        }
      }

      if (includeMention) {
        modules.mention = mentionOptions
      }

      quillRef.current = new Quill(editorContainer, {
        modules,
        placeholder,
        theme
      })

      const quill = quillRef.current

      if (defaultValueRef.current) {
        quill.setContents(quill.clipboard.convert({ html: defaultValueRef.current }))
      }

      quill.root.addEventListener(
        'paste',
        (event: ClipboardEvent) => {
          const clipboardData = event.clipboardData
          if (!clipboardData) return

          const items = [...clipboardData.items]
          const hasImageFile = items.some(item => item.type.startsWith('image/'))

          if (hasImageFile) {
            event.preventDefault()
            event.stopPropagation()

            // Optionally paste text only
            const text = clipboardData.getData('text/plain')
            if (text) {
              const selection = quill.getSelection(true)
              if (selection) {
                quill.insertText(selection.index, text, 'user')
                quill.setSelection(selection.index + text.length)
              }
            }
          }
        },
        true
      )

      quill.on(Quill.events.TEXT_CHANGE, () => {
        onChangeRef.current?.(
          quill.getLength() <= 1 ? '' : normalizeRgbColorsToHex(quill.root.innerHTML)
        )
      })

      if (minHeight !== undefined) {
        quill.root.style.minHeight = typeof minHeight === 'number' ? `${minHeight}px` : minHeight
      }
    }

    setupQuill()

    return () => {
      container.innerHTML = ''
      quillRef.current?.blur()
      quillRef.current = undefined
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div ref={containerRef} />
}
