'use client'

type Props = { text: string; label?: string }

export default function CopyButton({ text, label = 'Копировать' }: Props) {
  async function onCopy() {
    try {
      await navigator.clipboard?.writeText(text)
    } catch {
      // ignore
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className="inline-flex items-center gap-1 rounded border border-divider px-2 py-1 text-xs hover:bg-content2 bg-content1 text-foreground"
      title={label}
    >
      <span>📋</span>
      <span>{label}</span>
    </button>
  )
}



