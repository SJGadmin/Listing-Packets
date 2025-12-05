'use client'

import Link from 'next/link'
import { Calendar, Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface PacketCardProps {
    packet: {
        id: string
        slug: string
        title: string
        subtitle?: string
        cover_image_url?: string
        created_at: string
        agent?: {
            name: string
        }
    }
}

export default function PacketCard({ packet }: PacketCardProps) {
    const [copied, setCopied] = useState(false)

    const handleCopyLink = () => {
        const url = `${window.location.origin}/p/${packet.slug}`
        navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group">
            {/* Cover Image */}
            {packet.cover_image_url ? (
                <div className="h-48 bg-slate-200 relative overflow-hidden">
                    <img
                        src={packet.cover_image_url}
                        alt={packet.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
            ) : (
                <div className="h-48 bg-slate-900 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white opacity-20">
                        {packet.title.charAt(0)}
                    </span>
                </div>
            )}

            {/* Content */}
            <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">
                    {packet.title}
                </h3>
                {packet.subtitle && (
                    <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                        {packet.subtitle}
                    </p>
                )}

                {/* Agent and Date */}
                <div className="flex items-center justify-between text-xs text-slate-500 mb-4 pb-4 border-b border-slate-100">
                    {packet.agent?.name && (
                        <span className="font-medium">{packet.agent.name}</span>
                    )}
                    <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(packet.created_at).toLocaleDateString()}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <Link
                        href={`/p/${packet.slug}`}
                        className="flex-1 bg-slate-900 text-white py-2 px-4 rounded-lg text-center font-medium hover:bg-slate-800 transition-colors text-sm"
                    >
                        View Packet
                    </Link>
                    <button
                        onClick={handleCopyLink}
                        className={`${
                            copied
                                ? 'bg-green-100 text-green-700'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        } p-2 rounded-lg transition-colors`}
                        title={copied ? 'Copied!' : 'Copy Link'}
                    >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                </div>
            </div>
        </div>
    )
}
