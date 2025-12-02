'use client'

import { useRef, useState } from 'react'
import { Bold, Italic, Underline as UnderlineIcon, List } from 'lucide-react'

interface RichTextEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    rows?: number
    className?: string
}

export default function RichTextEditor({ value, onChange, placeholder, rows = 3, className = '' }: RichTextEditorProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const [selectionStart, setSelectionStart] = useState(0)
    const [selectionEnd, setSelectionEnd] = useState(0)

    const handleSelectionChange = () => {
        if (textareaRef.current) {
            setSelectionStart(textareaRef.current.selectionStart)
            setSelectionEnd(textareaRef.current.selectionEnd)
        }
    }

    const wrapSelection = (prefix: string, suffix: string) => {
        if (!textareaRef.current) return

        const start = textareaRef.current.selectionStart
        const end = textareaRef.current.selectionEnd
        const selectedText = value.substring(start, end)

        // If no text selected, insert placeholder
        const textToWrap = selectedText || 'text'
        const newText = value.substring(0, start) + prefix + textToWrap + suffix + value.substring(end)

        onChange(newText)

        // Restore focus and set cursor position after the inserted text
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus()
                const newCursorPos = start + prefix.length + textToWrap.length + suffix.length
                textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
            }
        }, 0)
    }

    const insertBulletList = () => {
        if (!textareaRef.current) return

        const start = textareaRef.current.selectionStart
        const end = textareaRef.current.selectionEnd
        const selectedText = value.substring(start, end)

        // If text is selected, convert each line to bullet point
        if (selectedText) {
            const lines = selectedText.split('\n')
            const bulletedText = lines.map(line => line.trim() ? `• ${line.trim()}` : line).join('\n')
            const newText = value.substring(0, start) + bulletedText + value.substring(end)
            onChange(newText)
        } else {
            // Insert a new bullet point
            const newText = value.substring(0, start) + '• ' + value.substring(end)
            onChange(newText)
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.focus()
                    const newCursorPos = start + 2
                    textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
                }
            }, 0)
        }
    }

    return (
        <div className={`border border-slate-300 rounded-md overflow-hidden ${className}`}>
            {/* Toolbar */}
            <div className="bg-slate-50 border-b border-slate-300 p-2 flex gap-1">
                <button
                    type="button"
                    onClick={() => wrapSelection('**', '**')}
                    className="p-2 hover:bg-slate-200 rounded transition-colors"
                    title="Bold"
                >
                    <Bold size={16} className="text-slate-700" />
                </button>
                <button
                    type="button"
                    onClick={() => wrapSelection('*', '*')}
                    className="p-2 hover:bg-slate-200 rounded transition-colors"
                    title="Italic"
                >
                    <Italic size={16} className="text-slate-700" />
                </button>
                <button
                    type="button"
                    onClick={() => wrapSelection('__', '__')}
                    className="p-2 hover:bg-slate-200 rounded transition-colors"
                    title="Underline"
                >
                    <UnderlineIcon size={16} className="text-slate-700" />
                </button>
                <div className="w-px bg-slate-300 mx-1" />
                <button
                    type="button"
                    onClick={insertBulletList}
                    className="p-2 hover:bg-slate-200 rounded transition-colors"
                    title="Bullet List"
                >
                    <List size={16} className="text-slate-700" />
                </button>
            </div>

            {/* Textarea */}
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onSelect={handleSelectionChange}
                onClick={handleSelectionChange}
                onKeyUp={handleSelectionChange}
                placeholder={placeholder}
                rows={rows}
                className="w-full px-3 py-2 focus:ring-2 focus:ring-slate-900 outline-none resize-none"
            />

            {/* Format guide */}
            <div className="bg-slate-50 border-t border-slate-300 px-3 py-1.5 text-xs text-slate-500">
                Formatting: **bold**, *italic*, __underline__, • bullets
            </div>
        </div>
    )
}
