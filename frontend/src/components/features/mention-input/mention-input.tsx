import $appConfig from '@common/globalStates/$appConfig'
import { Mentions, type MentionsProps, theme } from 'antd'
import { useAtomValue } from 'jotai'

const TOKEN_PATTERN = /(#\{[\w-]+\})/

/**
 * antd Mentions with its `#{field}` tokens drawn as tags. The textarea stays the
 * real input (its text is transparent); an aria-hidden overlay paints the tags.
 */
export default function MentionInput(props: MentionsProps) {
  const { token } = theme.useToken()
  const { isDarkTheme } = useAtomValue($appConfig)
  const text = typeof props.value === 'string' ? props.value : ''
  // Same chip colors as QuillEditor's mentions
  const tagColor = isDarkTheme ? '#475569' : '#d3e1eb'

  return (
    <div
      css={{
        '& textarea::selection': { background: 'Highlight', color: 'transparent' },
        position: 'relative'
      }}
    >
      <div
        aria-hidden
        style={{
          border: '1px solid transparent',
          color: token.colorText,
          fontSize: token.fontSize,
          inset: 0,
          lineHeight: token.lineHeight,
          overflow: 'hidden',
          overflowWrap: 'break-word',
          padding: '8px 11px',
          pointerEvents: 'none',
          position: 'absolute',
          whiteSpace: 'pre-wrap',
          zIndex: 1
        }}
      >
        {text.split(TOKEN_PATTERN).map((part, index) =>
          TOKEN_PATTERN.test(part) ? (
            <span key={index}>
              <span style={{ color: 'transparent' }}>#</span>
              <span
                style={{
                  background: tagColor,
                  borderRadius: 4,
                  boxShadow: `-3px 0 0 ${tagColor}, 3px 0 0 ${tagColor}`,
                  left: '-0.32em',
                  position: 'relative'
                }}
              >
                {part.slice(1)}
              </span>
            </span>
          ) : (
            part
          )
        )}
      </div>
      <Mentions
        autoSize
        prefix="#"
        {...props}
        styles={{ textarea: { caretColor: token.colorText, color: 'transparent' } }}
      />
    </div>
  )
}
