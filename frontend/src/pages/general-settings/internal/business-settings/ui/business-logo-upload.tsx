import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import If from '@utilities/If'
import { Button } from 'antd'
import { useContext } from 'react'
import { LuUpload, LuX } from 'react-icons/lu'

interface BusinessLogoUploadProps {
  disabled?: boolean
  onChange?: (url?: string) => void
  value?: string
}

export default function BusinessLogoUpload({
  disabled = false,
  onChange,
  value
}: BusinessLogoUploadProps) {
  const { messageApi } = useContext(NotifyContext)
  const LOGOSIZE = 2 * 1024 * 1024
  const openMediaLibrary = () => {
    if (disabled) return

    if (!window.wp?.media) {
      console.error('WordPress media library is not available')
      return
    }

    const mediaFrame = window.wp.media({
      button: { text: __('Select Logo') },
      library: { type: 'image' },

      multiple: false,
      title: __('Select or Upload Logo')
    })

    mediaFrame.on('select', () => {
      const attachment = mediaFrame.state().get('selection').first().toJSON()

      if (attachment.filesizeInBytes && attachment.filesizeInBytes > LOGOSIZE) {
        messageApi?.error(__('File size exceeds 2MB. Please choose a smaller file.'))
      } else {
        onChange?.(attachment.url)
      }
    })

    mediaFrame.open()
  }

  return (
    <div className="flex items-center justify-start">
      <div>
        {value ? (
          <div className="relative">
            <div>
              <img
                alt={__('Business Logo')}
                className="h-auto max-h-32 w-auto max-w-48 object-contain"
                src={value}
              />
            </div>
            <If conditions={!disabled}>
              <Button
                aria-label={__('Remove Logo')}
                className="absolute -right-2 -top-2 shadow-md"
                danger
                disabled={disabled}
                icon={<LuX />}
                onClick={() => onChange?.()}
                shape="circle"
                size="small"
              />
            </If>
          </div>
        ) : (
          <Button
            className="flex flex-col px-8 py-16 text-base"
            disabled={disabled}
            icon={<LuUpload size={24} />}
            onClick={openMediaLibrary}
            type="dashed"
          >
            {__('Upload Logo')}
          </Button>
        )}
      </div>
    </div>
  )
}
