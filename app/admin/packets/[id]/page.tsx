import { sql } from '@/lib/db'
import PacketForm from '@/components/PacketForm'
import { notFound } from 'next/navigation'
import { Packet, PacketItem } from '@/types'

export const dynamic = 'force-dynamic'

export default async function EditPacketPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    // Fetch packet
    const { rows: [packetRow] } = await sql`
        SELECT * FROM packets WHERE id = ${id}
    `

    if (!packetRow) {
        notFound()
    }
    const packet = packetRow as Packet

    // Fetch items
    const { rows: itemRows } = await sql`
        SELECT * FROM packet_items
        WHERE packet_id = ${id}
        ORDER BY "order" ASC
    `
    const items = itemRows as PacketItem[]

    // Fetch agents
    const { rows: agents } = await sql`
        SELECT * FROM agents ORDER BY name ASC
    `

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
