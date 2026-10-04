export type FormatAction =
  | 'bold'
  | 'italic'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'ul'
  | 'ol'
  | 'check'
  | 'quote'
  | 'code'
  | 'codeblock'
  | 'link'
  | 'indent'
  | 'outdent'

type FormatResult = {
  value: string
  selectionStart: number
  selectionEnd: number
}

// CommonMark needs ≥3 spaces to nest under `1. `; 4 is safe for ol + ul.
const INDENT = '    '

function wrapInline(
  value: string,
  start: number,
  end: number,
  before: string,
  after: string,
  placeholder: string,
): FormatResult {
  const selected = value.slice(start, end)
  const content = selected || placeholder
  const next = value.slice(0, start) + before + content + after + value.slice(end)
  const selectionStart = start + before.length
  const selectionEnd = selectionStart + content.length
  return { value: next, selectionStart, selectionEnd }
}

function selectedLines(
  value: string,
  start: number,
  end: number,
): { lineStart: number; lineEnd: number; lines: string[] } {
  const lineStart = value.lastIndexOf('\n', start - 1) + 1
  let lineEnd = value.indexOf('\n', end)
  if (lineEnd === -1) lineEnd = value.length
  const block = value.slice(lineStart, lineEnd)
  return {
    lineStart,
    lineEnd,
    lines: block.length === 0 ? [''] : block.split('\n'),
  }
}

function replaceLines(
  value: string,
  lineStart: number,
  lineEnd: number,
  lines: string[],
): FormatResult {
  const formatted = lines.join('\n')
  const next = value.slice(0, lineStart) + formatted + value.slice(lineEnd)
  return {
    value: next,
    selectionStart: lineStart,
    selectionEnd: lineStart + formatted.length,
  }
}

function stripListMarker(text: string): string {
  return text
    .replace(/^([-*+]|\d+\.)\s+/, '')
    .replace(/^\[[ xX]\]\s+/, '')
}

function splitIndent(line: string): { indent: string; rest: string } {
  const match = line.match(/^(\s*)(.*)$/)
  return {
    indent: match?.[1] ?? '',
    rest: match?.[2] ?? '',
  }
}

function prefixLines(
  value: string,
  start: number,
  end: number,
  prefixFor: (index: number, indent: string, rest: string) => string,
  emptyPlaceholder = 'List item',
): FormatResult {
  const { lineStart, lineEnd, lines } = selectedLines(value, start, end)
  const source = lines.length === 1 && lines[0] === '' ? [emptyPlaceholder] : lines
  const formatted = source.map((line, index) => {
    const raw = line.length === 0 ? emptyPlaceholder : line
    const { indent, rest } = splitIndent(raw)
    return prefixFor(index, indent, rest)
  })
  return replaceLines(value, lineStart, lineEnd, formatted)
}

function changeIndent(
  value: string,
  start: number,
  end: number,
  direction: 'in' | 'out',
): FormatResult {
  const { lineStart, lineEnd, lines } = selectedLines(value, start, end)
  const nextLines = lines.map((line) => {
    if (direction === 'in') {
      return INDENT + line
    }
    if (line.startsWith(INDENT)) {
      return line.slice(INDENT.length)
    }
    if (line.startsWith('\t')) {
      return line.slice(1)
    }
    // Also peel older 2-space indents from before this fix.
    return line.replace(/^ {1,4}/, '')
  })
  return replaceLines(value, lineStart, lineEnd, nextLines)
}

export function applyMarkdownFormat(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  action: FormatAction,
): FormatResult {
  switch (action) {
    case 'bold':
      return wrapInline(value, selectionStart, selectionEnd, '**', '**', 'bold text')
    case 'italic':
      return wrapInline(value, selectionStart, selectionEnd, '*', '*', 'italic text')
    case 'code':
      return wrapInline(value, selectionStart, selectionEnd, '`', '`', 'code')
    case 'link':
      return wrapInline(value, selectionStart, selectionEnd, '[', '](https://)', 'link text')
    case 'h1':
      return prefixLines(value, selectionStart, selectionEnd, (_i, indent, rest) =>
        `${indent}# ${rest.replace(/^#{1,6}\s+/, '')}`,
      )
    case 'h2':
      return prefixLines(value, selectionStart, selectionEnd, (_i, indent, rest) =>
        `${indent}## ${rest.replace(/^#{1,6}\s+/, '')}`,
      )
    case 'h3':
      return prefixLines(value, selectionStart, selectionEnd, (_i, indent, rest) =>
        `${indent}### ${rest.replace(/^#{1,6}\s+/, '')}`,
      )
    case 'ul':
      return prefixLines(
        value,
        selectionStart,
        selectionEnd,
        (_i, indent, rest) => `${indent}- ${stripListMarker(rest)}`,
      )
    case 'ol':
      return prefixLines(
        value,
        selectionStart,
        selectionEnd,
        (i, indent, rest) => `${indent}${i + 1}. ${stripListMarker(rest)}`,
      )
    case 'check':
      return prefixLines(
        value,
        selectionStart,
        selectionEnd,
        (_i, indent, rest) => `${indent}- [ ] ${stripListMarker(rest)}`,
      )
    case 'quote':
      return prefixLines(
        value,
        selectionStart,
        selectionEnd,
        (_i, indent, rest) => `${indent}> ${rest.replace(/^>\s?/, '')}`,
        'quote',
      )
    case 'indent':
      return changeIndent(value, selectionStart, selectionEnd, 'in')
    case 'outdent':
      return changeIndent(value, selectionStart, selectionEnd, 'out')
    case 'codeblock': {
      const selected = value.slice(selectionStart, selectionEnd) || 'code'
      const block = `\n\`\`\`\n${selected}\n\`\`\`\n`
      const next =
        value.slice(0, selectionStart) + block + value.slice(selectionEnd)
      const innerStart = selectionStart + '\n```\n'.length
      return {
        value: next,
        selectionStart: innerStart,
        selectionEnd: innerStart + selected.length,
      }
    }
  }
}
