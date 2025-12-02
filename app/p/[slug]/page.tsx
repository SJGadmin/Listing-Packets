import { createClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import PacketItemCard from '@/components/PacketItemCard'
import DescriptionAccordion from '@/components/DescriptionAccordion'
import FormattedText from '@/components/FormattedText'
import { headers } from 'next/headers'

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
        .select(`
            *,
            agent:agents(id, name, email, phone, headshot_url)
        `)
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
        <div className="min-h-screen bg-slate-50 relative">
            {/* Topographic background pattern with opacity */}
            <div
                className="fixed inset-0 opacity-[0.05] pointer-events-none z-0"
                style={{
                    backgroundImage: 'url(/topographic-pattern.png)',
                    backgroundRepeat: 'repeat',
                    backgroundSize: '600px 600px',
                }}
            />
            {/* Hero Section */}
            <div className="relative h-[50vh] min-h-[400px] bg-slate-900 flex flex-col items-center justify-center text-center px-4">
                {packet.cover_image_url && (
                    <div className="absolute inset-0 z-0">
                        <img
                            src={packet.cover_image_url}
                            alt="Cover"
                            className="w-full h-full object-cover opacity-40"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/50" />
                    </div>
                )}

                <div className="relative z-10 flex flex-col items-center max-w-5xl mx-auto">
                    {/* Welcome to text */}
                    <p className="text-lg md:text-xl text-slate-200 font-light mb-2">Welcome to</p>

                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-xl tracking-tight">
                        <FormattedText text={packet.title} />
                    </h1>
                    {packet.subtitle && (
                        <div className="text-xl md:text-2xl text-slate-200 font-light tracking-wide">
                            <FormattedText text={packet.subtitle} />
                        </div>
                    )}
                </div>

                {/* Agent Info - Responsive positioning */}
                {packet.agent && (
                    <div className="absolute bottom-4 left-4 md:bottom-8 md:left-12 lg:left-16 xl:left-20 z-10 flex flex-col items-center">
                        {/* Headshot above the card, centered - smaller on mobile */}
                        {packet.agent.headshot_url ? (
                            <img
                                src={packet.agent.headshot_url}
                                alt={packet.agent.name}
                                className="w-20 h-20 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-full object-cover border-2 md:border-4 border-white shadow-xl mb-[-12px] md:mb-[-20px] relative z-10"
                            />
                        ) : (
                            <div className="w-20 h-20 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-full bg-white flex items-center justify-center text-slate-600 border-2 md:border-4 border-white shadow-xl mb-[-12px] md:mb-[-20px] relative z-10">
                                <span className="text-2xl md:text-4xl lg:text-5xl font-bold">{packet.agent.name.charAt(0)}</span>
                            </div>
                        )}
                        {/* Card with contact info - more compact on mobile */}
                        <div className="bg-white/90 backdrop-blur-md rounded-lg p-3 pt-5 md:p-4 md:pt-8 lg:p-5 lg:pt-10 shadow-xl min-w-[160px] md:min-w-[200px] lg:min-w-[240px] text-center">
                            <p className="font-bold text-slate-900 text-sm md:text-base lg:text-lg mb-1 md:mb-2">{packet.agent.name}</p>
                            {packet.agent.phone && (
                                <a href={`tel:${packet.agent.phone}`} className="text-xs md:text-sm text-slate-700 mb-0.5 md:mb-1 hover:text-slate-900 hover:underline block">
                                    {packet.agent.phone}
                                </a>
                            )}
                            {packet.agent.email && (
                                <a href={`mailto:${packet.agent.email}`} className="text-xs md:text-sm text-slate-700 hover:text-slate-900 hover:underline block truncate max-w-[140px] md:max-w-[180px] lg:max-w-none mx-auto">
                                    {packet.agent.email}
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Description Section */}
            {packet.description && (
                <div className="w-full bg-white border-b border-slate-100">
                    <div className="max-w-[95%] md:max-w-7xl mx-auto px-4 py-12 md:py-16">
                        <DescriptionAccordion description={packet.description} />
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
            <footer className="text-center py-12 border-t border-slate-200 mt-12">
                <a
                    href="https://www.stewartandjane.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 hover:text-slate-900 underline font-medium transition-colors"
                >
                    Stewart and Jane Group
                </a>
            </footer>
        </div>
    )
}
