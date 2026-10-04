import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Props = {
  source: string
  className?: string
}

export function MarkdownView({ source, className }: Props) {
  return (
    <div className={className ? `md-body ${className}` : 'md-body'}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {source || '_Nothing here yet._'}
      </ReactMarkdown>
    </div>
  )
}
