import PacketForm from '@/components/PacketForm'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function NewPacketPage() {
    const agents = await prisma.agent.findMany({
        orderBy: { name: 'asc' }
    })

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-8">Create New Packet</h1>
            <PacketForm agents={agents || []} />
        </div>
    )
}
