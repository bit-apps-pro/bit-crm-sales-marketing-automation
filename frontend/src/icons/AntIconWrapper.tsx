interface AntIconWrapperPropsTypes {
  children: JSX.Element
  className?: string
}

export default function AntIconWrapper({ children, className }: AntIconWrapperPropsTypes): JSX.Element {
  return (
    <span className={'anticon ' + className} role="img">
      {children}
    </span>
  )
}
