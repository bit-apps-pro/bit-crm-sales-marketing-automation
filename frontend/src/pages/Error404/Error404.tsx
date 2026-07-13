import { Button, Result } from 'antd'
import { useNavigate } from 'react-router'

export default function Error404() {
  const navigate = useNavigate()

  return (
    <Result
      extra={
        <Button onClick={() => navigate('/', { replace: true })} type="primary">
          Back Home
        </Button>
      }
      status="404"
      subTitle="Sorry, the page you visited does not exist."
      title="404"
    />
  )
}
