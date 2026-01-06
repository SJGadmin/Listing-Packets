import { sql } from '@/lib/db'
import Link from 'next/link'
import PacketCard from '@/components/PacketCard'

export const dynamic = 'force-dynamic'

export default async function AllPacketsPage() {
    const { rows: packets } = await sql`
        SELECT
            p.*,
            json_build_object('name', a.name) as agent
        FROM packets p
        LEFT JOIN agents a ON p.agent_id = a.id
        ORDER BY p.created_at DESC
    `

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">All Packets</h1>
                            <p className="text-slate-600 mt-2">Browse and share property packets</p>
                        </div>
                        <Link href="/" className="text-slate-600 hover:text-slate-900 font-medium">
                            Back to Home
                        </Link>
                    </div>
                </div>
            </header>

            {/* Packets Grid */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                {packets && packets.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {packets.map((packet: any) => (
                            <PacketCard key={packet.id} packet={packet} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
                        <p className="text-slate-500 text-lg">No packets available yet.</p>
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
