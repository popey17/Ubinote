type Props = {
  className?: string
  title?: string
}

export function BrandMark({ className, title = 'ubinote' }: Props) {
  return (
    <span className={className ? `brand-lockup ${className}` : 'brand-lockup'}>
      <svg
        className="brand-icon"
        viewBox="0 0 64 64"
        width="28"
        height="28"
        aria-hidden="true"
        focusable="false"
      >
        <rect width="64" height="64" rx="14" fill="#101612" />
        <path
          d="M18 12h20.5L46 19.5V52a2 2 0 0 1-2 2H18a2 2 0 0 1-2-2V14a2 2 0 0 1 2-2Z"
          fill="#1a2420"
          stroke="#3d8f6b"
          strokeWidth="2"
        />
        <path
          d="M38.5 12v7.5H46"
          stroke="#3d8f6b"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M22 28h20M22 35h16M22 42h12"
          stroke="#8fd0b0"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
      <span className="brand-text">{title}</span>
    </span>
  )
}
