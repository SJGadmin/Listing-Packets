import { prisma } from '@/lib/db'
import PacketForm from '@/components/PacketForm'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function EditPacketPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    // Fetch packet with items
    const packet = await prisma.packet.findUnique({
        where: { id },
        include: {
            items: {
                orderBy: { order: 'asc' }
            }
        }
    })

    if (!packet) {
        notFound()
    }

    // Fetch agents
    const agents = await prisma.agent.findMany({
        orderBy: { name: 'asc' }
    })

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-8">Edit Packet</h1>
            <PacketForm
                initialPacket={packet}
                initialItems={packet.items || []}
                isEditing={true}
                agents={agents || []}
            />
        </div>
    )
}
