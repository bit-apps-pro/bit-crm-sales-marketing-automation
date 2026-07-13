import { __ } from '@common/helpers/i18nWrap'
import { Button, Result } from 'antd'
import { useNavigate } from 'react-router'

export default function AccessDenied() {
  const navigate = useNavigate()

  return (
    <Result
      extra={
        <Button onClick={() => navigate('/', { replace: true })} type="primary">
          Back Home
        </Button>
      }
      status="403"
      title={__('Access Denied')}
      subTitle={__('Sorry, you are not authorized to access this page!')}
    />
  )
}
