import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { Plus, ExternalLink, Eye, Calendar } from 'lucide-react'
import { Packet } from '@/types'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
    const supabase = createClient()

    // Fetch packets with view counts
    const { data: packets, error } = await supabase
        .from('packets')
        .select(`
      *,
      packet_views (count)
    `)
        .order('created_at', { ascending: false })

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-md">
                Error loading packets: {error.message}
            </div>
        )
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Packets</h1>
                    <p className="text-slate-500 mt-1">Manage your real estate packets</p>
                </div>
                <Link
                    href="/admin/packets/new"
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition-colors"
                >
                    <Plus size={18} />
                    Create Packet
                </Link>
            </div>

            <div className="grid gap-4">
                {packets?.map((packet: any) => (
                    <div
                        key={packet.id}
                        className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex items-center justify-between hover:shadow-md transition-shadow"
                    >
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-lg font-semibold text-slate-900">
                                    {packet.title}
                                </h3>
                                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-mono">
                                    /{packet.slug}
                                </span>
                            </div>
                            {packet.subtitle && (
                                <p className="text-slate-500 text-sm mb-2">{packet.subtitle}</p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-slate-400">
                                <div className="flex items-center gap-1">
                                    <Calendar size={14} />
                                    {new Date(packet.created_at).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Eye size={14} />
                                    {packet.packet_views?.[0]?.count || 0} views
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <a
                                href={`/p/${packet.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-md transition-colors"
                                title="View Public Page"
                            >
                                <ExternalLink size={20} />
                            </a>
                            <Link
                                href={`/admin/packets/${packet.id}`}
                                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-md hover:bg-slate-50 hover:text-slate-900 transition-colors text-sm font-medium"
                            >
                                Edit
                            </Link>
                        </div>
                    </div>
                ))}

                {packets?.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg border border-dashed border-slate-300">
                        <p className="text-slate-500 mb-4">No packets created yet.</p>
                        <Link
                            href="/admin/packets/new"
                            className="inline-flex items-center gap-2 text-slate-900 font-medium hover:underline"
                        >
                            <Plus size={18} />
                            Create your first packet
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
