'use client'

import { PacketItem } from '@/types'
import { FileText, Link as LinkIcon, Download, ExternalLink, Eye, X } from 'lucide-react'
import { useState } from 'react'

export default function PacketItemCard({ item }: { item: PacketItem }) {
    const [showPreview, setShowPreview] = useState(false)
    const Icon = item.type === 'file' ? FileText : item.type === 'link' ? LinkIcon : null

    // Determine if file can be previewed (PDF, images)
    const canPreview = item.type === 'file' && item.url && (
        item.url.toLowerCase().endsWith('.pdf') ||
        item.url.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
    )

    if (item.type === 'text') {
        return (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-slate-900 mb-4">{item.label}</h3>
                <div className="prose prose-slate max-w-none text-slate-600 whitespace-pre-wrap">
                    {item.content}
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex items-center justify-between group">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                        {Icon && <Icon size={24} />}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">{item.label}</h3>
                        <p className="text-sm text-slate-500 capitalize">{item.type}</p>
                    </div>
                </div>

                {item.url && (
                    <div className="flex items-center gap-2">
                        {canPreview && (
                            <button
                                onClick={() => setShowPreview(true)}
                                className="px-6 py-2 bg-slate-200 text-slate-700 rounded-full text-sm font-medium hover:bg-slate-300 transition-colors flex items-center gap-2"
                            >
                                Preview <Eye size={16} />
                            </button>
                        )}
                        <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={item.type === 'file'}
                            className="px-6 py-2 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2"
                        >
                            {item.type === 'file' ? (
                                <>
                                    Download <Download size={16} />
                                </>
                            ) : (
                                <>
                                    Open Link <ExternalLink size={16} />
                                </>
                            )}
                        </a>
                    </div>
                )}
            </div>

            {/* Preview Modal */}
            {showPreview && canPreview && (
                <div
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                    onClick={() => setShowPreview(false)}
                >
                    <div
                        className="relative bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-200">
                            <h3 className="text-lg font-bold text-slate-900">{item.label}</h3>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X size={24} className="text-slate-600" />
                            </button>
                        </div>

                        {/* Preview Content */}
                        <div className="flex-1 overflow-auto p-4">
                            {item.url && item.url.toLowerCase().endsWith('.pdf') ? (
                                <iframe
                                    src={item.url}
                                    className="w-full h-full border-0"
                                    title={item.label}
                                />
                            ) : item.url && (
                                <img
                                    src={item.url}
                                    alt={item.label}
                                    className="max-w-full h-auto mx-auto"
                                />
                            )}
                        </div>

                        {/* Footer with Download Button */}
                        <div className="p-4 border-t border-slate-200 flex justify-end">
                            {item.url && (
                                <a
                                    href={item.url}
                                    download
                                    className="px-6 py-2 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2"
                                >
                                    Download <Download size={16} />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
