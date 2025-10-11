'use client'

interface Props {
  children: React.ReactNode
}

export function SuppressHydrationWarning({ children }: Props) {
  return <div suppressHydrationWarning>{children}</div>
}