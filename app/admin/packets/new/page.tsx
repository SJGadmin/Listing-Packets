import PacketForm from '@/components/PacketForm'
import { createClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default async function NewPacketPage() {
    const supabase = createClient()
    const { data: agents } = await supabase.from('agents').select('*').order('name', { ascending: true })

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-8">Create New Packet</h1>
            <PacketForm agents={agents || []} />
        </div>
    )
}
