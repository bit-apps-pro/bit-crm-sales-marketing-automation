import { __ } from '@common/helpers/i18nWrap'
import { type EntityTagsPropsType } from '@features/entity-form/shared/entity-form-types'
import If from '@utilities/If'
import { Form, Select } from 'antd'
import { LuLoaderCircle, LuPlus } from 'react-icons/lu'

export default function EntityTags({
  disabled = false,
  label = '',
  loading,
  onAddTag,
  onRemoveTag,
  options,
  value
}: EntityTagsPropsType) {
  return (
    <Form.Item className="mb-0" label={label} layout="vertical">
      <Select
        disabled={disabled}
        loading={loading}
        mode="tags"
        onDeselect={tag => onRemoveTag(tag)}
        onSelect={tag => onAddTag(tag)}
        optionRender={current => {
          const isExistingTag = options?.map(tag => tag.label).includes(current.data.label)
          return (
            <div className="flex items-center gap-2">
              <If conditions={!isExistingTag}>
                <div className="flex items-center gap-1">
                  {loading ? (
                    <LuLoaderCircle className="animate-spin" size={14} />
                  ) : (
                    <LuPlus size={14} />
                  )}
                  {__('Create Tag:')}
                </div>
              </If>
              {current.data.label}
            </div>
          )
        }}
        options={options}
        placeholder={__('Attach tags')}
        value={value}
      />
    </Form.Item>
  )
}
