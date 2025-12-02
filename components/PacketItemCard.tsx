import { PacketItem } from '@/types'
import { FileText, Link as LinkIcon, Download, ExternalLink } from 'lucide-react'

export default function PacketItemCard({ item }: { item: PacketItem }) {
    const Icon = item.type === 'file' ? FileText : item.type === 'link' ? LinkIcon : null

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
                <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
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
            )}
        </div>
    )
}
