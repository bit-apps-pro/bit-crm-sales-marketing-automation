import { HomeOutlined } from '@ant-design/icons'
import { Breadcrumb as AntBreadcrumb } from 'antd'
import { Link } from 'react-router'

interface BreadcrumbItem {
  title: JSX.Element | string
  to?: string
}

interface BreadcrumbProps {
  className?: string
  items: BreadcrumbItem[]
}

const Breadcrumb = ({ className = 'ml-2', items }: BreadcrumbProps) => {
  const breadcrumbItems = [
    {
      title: (
        <Link to="/">
          <HomeOutlined />
        </Link>
      )
    },
    ...items.map(item => ({
      title: item.to ? <Link to={item.to}>{item.title}</Link> : <span>{item.title}</span>
    }))
  ]
  return <AntBreadcrumb className={className} items={breadcrumbItems} />
}

export default Breadcrumb
