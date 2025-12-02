import React from 'react'

interface FormattedTextProps {
    text: string
    className?: string
}

export default function FormattedText({ text, className = '' }: FormattedTextProps) {
    // Parse simple markdown-like formatting
    const formatText = (input: string) => {
        let formatted = input

        // Replace **bold** with <strong>
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

        // Replace *italic* with <em>
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>')

        // Replace __underline__ with <u>
        formatted = formatted.replace(/__(.*?)__/g, '<u>$1</u>')

        return formatted
    }

    // Split by lines and handle bullets
    const lines = text.split('\n')
    const processedLines: React.ReactElement[] = []

    lines.forEach((line, index) => {
        const trimmed = line.trim()

        // Check if it's a bullet point
        if (trimmed.startsWith('•')) {
            const content = trimmed.substring(1).trim()
            processedLines.push(
                <li
                    key={index}
                    className="ml-4"
                    dangerouslySetInnerHTML={{ __html: formatText(content) }}
                />
            )
        } else if (trimmed) {
            processedLines.push(
                <p
                    key={index}
                    className="mb-2 last:mb-0"
                    dangerouslySetInnerHTML={{ __html: formatText(line) }}
                />
            )
        } else {
            // Empty line - add spacing
            processedLines.push(<div key={index} className="h-2" />)
        }
    })

    // Group consecutive <li> elements into <ul>
    const groupedElements: React.ReactElement[] = []
    let currentList: React.ReactElement[] = []

    processedLines.forEach((element, index) => {
        if (element.type === 'li') {
            currentList.push(element)
        } else {
            if (currentList.length > 0) {
                groupedElements.push(
                    <ul key={`ul-${index}`} className="list-none mb-2">
                        {currentList}
                    </ul>
                )
                currentList = []
            }
            groupedElements.push(element)
        }
    })

    // Don't forget remaining list items
    if (currentList.length > 0) {
        groupedElements.push(
            <ul key="ul-final" className="list-none mb-2">
                {currentList}
            </ul>
        )
    }

    return <div className={className}>{groupedElements}</div>
}
