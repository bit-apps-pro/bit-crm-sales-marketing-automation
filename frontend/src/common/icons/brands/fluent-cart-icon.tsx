import { type SvgIconProps } from '../types'

export default function FluentCartIcon({ className, size = '1em' }: SvgIconProps) {
  return (
    <svg aria-hidden className={className} fill="none" height={size} viewBox="0 0 16 16" width={size}>
      <rect
        height="15.5"
        rx="1.35"
        stroke="currentColor"
        strokeWidth="0.5"
        width="15.5"
        x="0.25"
        y="0.25"
      />
      <path
        d="M7.28492 10.984H2.51562L3.26409 9.25314C3.48383 8.74498 3.98452 8.41602 4.53814 8.41602H10.2195L9.83303 9.30967C9.39356 10.326 8.39217 10.984 7.28492 10.984Z"
        fill="currentColor"
      />
      <path
        d="M11.2359 7.59624H4.52734L4.9138 6.70259C5.3533 5.68627 6.35468 5.02832 7.46194 5.02832H13.2584L12.5099 6.75912C12.2902 7.26728 11.7895 7.59624 11.2359 7.59624Z"
        fill="currentColor"
      />
    </svg>
  )
}
