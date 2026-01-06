import PacketForm from '@/components/PacketForm'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function NewPacketPage() {
    const { rows: agents } = await sql`SELECT * FROM agents ORDER BY name ASC`

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-8">Create New Packet</h1>
            <PacketForm agents={agents || []} />
        </div>
    )
}
