import { __ } from '@common/helpers/i18nWrap'
import { Form, Select, Typography } from 'antd'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Runs on every change before the value reaches the form, so a tag that is not
 * a valid address is never added in the first place. Also lowercases and
 * deduplicates, matching what EmailService does server-side.
 */
const toEmailTags = (value: string[]) => {
  const emails: string[] = []

  value.forEach(item => {
    const email = item.trim().toLowerCase()

    if (EMAIL_PATTERN.test(email) && !emails.includes(email)) {
      emails.push(email)
    }
  })

  return emails
}

interface EmailRecipientFieldProps {
  label: string
  name: string
  placeholder: string
}

/**
 * A tag-style address input for a recipient list such as Cc or Bcc. Only valid,
 * deduplicated addresses can end up in the form value.
 */
export default function EmailRecipientField({ label, name, placeholder }: EmailRecipientFieldProps) {
  return (
    <Form.Item getValueFromEvent={toEmailTags} label={label} name={name}>
      <Select
        maxTagCount="responsive"
        mode="tags"
        notFoundContent={
          <Typography.Text className="text-xs" type="secondary">
            {__('Type a valid email address to add it')}
          </Typography.Text>
        }
        placeholder={placeholder}
        tokenSeparators={[',', ';', ' ']}
      />
    </Form.Item>
  )
}
