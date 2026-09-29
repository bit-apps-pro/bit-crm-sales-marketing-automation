import { type SvgIconProps } from '../types'

export default function SureCartIcon({ className, size = '1em' }: SvgIconProps) {
  return (
    <svg aria-hidden className={className} fill="none" height={size} viewBox="0 0 16 16" width={size}>
      <rect
        height="15.5"
        rx="7.75"
        stroke="currentColor"
        strokeWidth="0.5"
        width="15.5"
        x="0.25"
        y="0.25"
      />
      <path
        d="M6.32891 5.45761C6.69314 5.09417 7.40589 4.7998 7.92084 4.7998H11.9179L10.2695 6.44432H5.33984L6.32891 5.45761Z"
        fill="currentColor"
      />
      <path
        clipRule="evenodd"
        d="M4.51756 7.26562H11.0517C12.0753 7.26562 12.3014 7.78371 11.5792 8.43759L11.2683 8.74608H4.71851C3.6949 8.74608 3.47825 8.23193 4.20671 7.57412L4.51756 7.26562Z"
        fill="currentColor"
        fillRule="evenodd"
      />
      <path
        clipRule="evenodd"
        d="M7.85646 11.2129C8.3714 11.2129 9.08416 10.9177 9.44839 10.5551L10.4375 9.56836H5.50782L3.85938 11.2129H7.85646Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  )
}
