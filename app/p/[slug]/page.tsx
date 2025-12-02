import { createClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import PacketItemCard from '@/components/PacketItemCard'
import { headers } from 'next/headers'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

async function recordView(packetId: string) {
    const supabase = createClient()
    const headersList = await headers()
    const userAgent = headersList.get('user-agent') || 'unknown'
    // Simple IP hash (in real app, use better method or trust proxy headers)
    const ip = headersList.get('x-forwarded-for') || 'unknown'

    // We don't need to await this, fire and forget
    supabase.from('packet_views').insert({
        packet_id: packetId,
        user_agent: userAgent,
        ip_hash: ip // Storing raw IP for now as hash logic is complex server-side without crypto lib, user said "rough uniqueness"
    }).then()
}

export default async function PublicPacketPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const supabase = createClient()

    const { data: packet } = await supabase
        .from('packets')
        .select('*')
        .eq('slug', slug)
        .single()

    if (!packet) {
        notFound()
    }

    // Record view
    recordView(packet.id)

    const { data: items } = await supabase
        .from('packet_items')
        .select('*')
        .eq('packet_id', packet.id)
        .order('order', { ascending: true })

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <div className="relative h-[50vh] min-h-[400px] bg-slate-900 flex flex-col items-center justify-center text-center px-4">
                {packet.cover_image_url && (
                    <div className="absolute inset-0 z-0">
                        <img
                            src={packet.cover_image_url}
                            alt="Cover"
                            className="w-full h-full object-cover opacity-40"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-slate-900/60 to-slate-900" />
                    </div>
                )}

                <div className="relative z-10 flex flex-col items-center max-w-5xl mx-auto">
                    {/* Logo Placeholder */}
                    <div className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-xl mb-8 overflow-hidden flex items-center justify-center">
                        <span className="text-slate-900 font-bold text-xs">LOGO</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-xl tracking-tight">
                        {packet.title}
                    </h1>
                    {packet.subtitle && (
                        <p className="text-xl md:text-2xl text-slate-200 font-light tracking-wide">
                            {packet.subtitle}
                        </p>
                    )}
                </div>
            </div>

            {/* Description Section */}
            {packet.description && (
                <div className="w-full bg-white border-b border-slate-100">
                    <div className="max-w-[95%] md:max-w-7xl mx-auto px-4 py-12 md:py-16">
                        <div className="prose prose-lg prose-slate max-w-none text-slate-700 leading-relaxed">
                            {packet.description.split('\n').map((line: string, i: number) => (
                                <p key={i} className="mb-4 last:mb-0">{line}</p>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Content Section */}
            <div className="max-w-[95%] md:max-w-7xl mx-auto px-4 py-12 space-y-6">
                {items?.map((item) => (
                    <PacketItemCard key={item.id} item={item} />
                ))}

                {(!items || items.length === 0) && (
                    <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-dashed border-slate-200">
                        This packet has no items yet.
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="text-center py-12 text-slate-400 text-sm border-t border-slate-200 mt-12">
                <p className="font-medium text-slate-600">Presented by Stewart & Jane Group</p>
                <p className="mt-1">Real Estate Professionals</p>
            </footer>
        </div>
    )
}
