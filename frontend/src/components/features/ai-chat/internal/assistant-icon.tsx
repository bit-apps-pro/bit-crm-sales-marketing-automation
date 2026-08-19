/**
 * A four-point sparkle with a smaller companion — the shape that reads as "AI"
 * without borrowing any vendor's mark. Drawn rather than pulled from an icon
 * set so the two stars can be weighted differently and the whole thing can
 * inherit currentColor.
 */
export default function AssistantIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.2 2.4a.55.55 0 0 0-1.04 0l-1.2 3.35a4.4 4.4 0 0 1-2.66 2.66l-3.35 1.2a.55.55 0 0 0 0 1.04l3.35 1.2a4.4 4.4 0 0 1 2.66 2.66l1.2 3.35a.55.55 0 0 0 1.04 0l1.2-3.35a4.4 4.4 0 0 1 2.66-2.66l3.35-1.2a.55.55 0 0 0 0-1.04l-3.35-1.2a4.4 4.4 0 0 1-2.66-2.66l-1.2-3.35Z"
        fill="currentColor"
      />
      <path
        d="M6.05 15.6a.35.35 0 0 0-.66 0l-.56 1.56a2.2 2.2 0 0 1-1.33 1.33l-1.56.56a.35.35 0 0 0 0 .66l1.56.56a2.2 2.2 0 0 1 1.33 1.33l.56 1.56a.35.35 0 0 0 .66 0l.56-1.56a2.2 2.2 0 0 1 1.33-1.33l1.56-.56a.35.35 0 0 0 0-.66l-1.56-.56a2.2 2.2 0 0 1-1.33-1.33L6.05 15.6Z"
        fill="currentColor"
        opacity="0.7"
      />
    </svg>
  )
}
