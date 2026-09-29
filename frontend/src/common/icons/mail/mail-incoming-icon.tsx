import { type SvgIconProps } from '../types'

export default function MailIncomingIcon({ className, size = '1em' }: SvgIconProps) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 16 16"
      width={size}
    >
      <path
        d="M14.6654 8.66699V4.00033C14.6654 3.6467 14.5249 3.30756 14.2748 3.05752C14.0248 2.80747 13.6857 2.66699 13.332 2.66699H2.66536C2.31174 2.66699 1.9726 2.80747 1.72256 3.05752C1.47251 3.30756 1.33203 3.6467 1.33203 4.00033V12.0003C1.33203 12.7337 1.93203 13.3337 2.66536 13.3337H7.9987M14.6654 4.66699L8.68536 8.46699C8.47955 8.59594 8.24158 8.66433 7.9987 8.66433C7.75582 8.66433 7.51785 8.59594 7.31203 8.46699L1.33203 4.66699"
        strokeWidth="1.33"
      />
      <path
        d="M15.1467 13.2942V12.7134C15.1467 12.4053 15.0243 12.1098 14.8064 11.8919C14.5886 11.6741 14.2931 11.5517 13.985 11.5517H10.5M11.9521 10.0996L10.5 11.5517L11.9521 13.0038"
        strokeWidth="1"
      />
    </svg>
  )
}
