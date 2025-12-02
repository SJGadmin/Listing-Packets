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
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Hero Section */}
            <div className="relative h-[40vh] min-h-[400px] bg-slate-900 flex flex-col items-center justify-center text-center px-4">
                {packet.cover_image_url && (
                    <div className="absolute inset-0 z-0">
                        <img
                            src={packet.cover_image_url}
                            alt="Cover"
                            className="w-full h-full object-cover opacity-50"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/90" />
                    </div>
                )}

                <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto">
                    {/* Logo Placeholder */}
                    <div className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-xl mb-6 overflow-hidden flex items-center justify-center">
                        {/* Replace with actual logo path */}
                        <span className="text-slate-900 font-bold text-xs">LOGO</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                        {packet.title}
                    </h1>
                    {packet.subtitle && (
                        <p className="text-xl text-slate-200 font-light mb-6">
                            {packet.subtitle}
                        </p>
                    )}
                    {packet.description && (
                        <p className="text-slate-300 max-w-2xl mx-auto leading-relaxed">
                            {packet.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-3xl mx-auto px-4 -mt-10 relative z-20 space-y-6">
                {items?.map((item) => (
                    <PacketItemCard key={item.id} item={item} />
                ))}

                {(!items || items.length === 0) && (
                    <div className="text-center py-12 text-slate-500">
                        This packet has no items yet.
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="text-center py-12 text-slate-400 text-sm">
                <p>Presented by Stewart & Jane Group</p>
                <p className="mt-1">Real Estate Professionals</p>
            </footer>
        </div>
    )
}
