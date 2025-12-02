'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import FormattedText from './FormattedText'

export default function DescriptionAccordion({ description }: { description: string }) {
    const [isExpanded, setIsExpanded] = useState(false)

    // Split by sentences (handles periods, question marks, exclamation marks)
    const sentences = description.match(/[^.!?]+[.!?]+/g) || [description]

    // Get first 4 sentences or first ~150 words (whichever comes first)
    const getPreview = () => {
        let preview = ''
        let wordCount = 0
        let sentenceCount = 0

        for (const sentence of sentences) {
            const words = sentence.trim().split(/\s+/).length
            if (sentenceCount < 4 && wordCount + words <= 150) {
                preview += sentence
                wordCount += words
                sentenceCount++
            } else if (sentenceCount === 0) {
                // If first sentence is over 150 words, show it anyway
                preview = sentences[0]
                break
            } else {
                break
            }
        }

        return preview.trim()
    }

    const preview = getPreview()
    const hasMore = description.length > preview.length

    if (!hasMore) {
        // If no truncation needed, just show the full description
        return (
            <div className="prose prose-xl prose-slate max-w-none text-slate-700 leading-relaxed">
                <FormattedText text={description} />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="prose prose-xl prose-slate max-w-none text-slate-700 leading-relaxed">
                <FormattedText text={isExpanded ? description : preview} />
            </div>

            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 text-slate-900 font-medium hover:text-slate-700 transition-colors group"
            >
                <span>{isExpanded ? 'Show Less' : 'Read More'}</span>
                <ChevronDown
                    size={20}
                    className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                />
            </button>
        </div>
    )
}
