import type { FormatAction } from '../lib/markdownFormat'

type Tool = {
  action: FormatAction
  label: string
  title: string
}

const TOOLS: Tool[] = [
  { action: 'h1', label: 'H1', title: 'Heading 1' },
  { action: 'h2', label: 'H2', title: 'Heading 2' },
  { action: 'h3', label: 'H3', title: 'Heading 3' },
  { action: 'bold', label: 'B', title: 'Bold' },
  { action: 'italic', label: 'I', title: 'Italic' },
  { action: 'ul', label: '• List', title: 'Bullet list' },
  { action: 'ol', label: '1. List', title: 'Numbered list' },
  { action: 'indent', label: 'Indent', title: 'Indent (nest list)' },
  { action: 'outdent', label: 'Outdent', title: 'Outdent (unnest list)' },
  { action: 'check', label: 'Task', title: 'Checklist' },
  { action: 'quote', label: 'Quote', title: 'Quote' },
  { action: 'code', label: '</>', title: 'Inline code' },
  { action: 'codeblock', label: '{ }', title: 'Code block' },
  { action: 'link', label: 'Link', title: 'Link' },
]

type Props = {
  onFormat: (action: FormatAction) => void
}

export function MarkdownToolbar({ onFormat }: Props) {
  return (
    <div className="md-toolbar" role="toolbar" aria-label="Markdown formatting">
      {TOOLS.map((tool) => (
        <button
          key={tool.action}
          type="button"
          className={`md-tool${tool.action === 'bold' ? ' md-tool-bold' : ''}${
            tool.action === 'italic' ? ' md-tool-italic' : ''
          }`}
          title={tool.title}
          aria-label={tool.title}
          onClick={() => onFormat(tool.action)}
        >
          {tool.label}
        </button>
      ))}
    </div>
  )
}
