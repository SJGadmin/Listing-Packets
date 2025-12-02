import { createClient } from '@/lib/supabase'
import PacketForm from '@/components/PacketForm'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function EditPacketPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = createClient()

    // Fetch packet
    const { data: packet, error: packetError } = await supabase
        .from('packets')
        .select('*')
        .eq('id', id)
        .single()

    if (packetError || !packet) {
        notFound()
    }

    // Fetch items
    const { data: items, error: itemsError } = await supabase
        .from('packet_items')
        .select('*')
        .eq('packet_id', id)
        .order('order', { ascending: true })

    // Fetch agents
    const { data: agents } = await supabase
        .from('agents')
        .select('*')
        .order('name', { ascending: true })

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-8">Edit Packet</h1>
            <PacketForm
                initialPacket={packet}
                initialItems={items || []}
                isEditing={true}
                agents={agents || []}
            />
        </div>
    )
}
