import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { Plus, User, Phone, Mail } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AgentsPage() {
    const supabase = createClient()

    const { data: agents, error } = await supabase
        .from('agents')
        .select('*')
        .order('name', { ascending: true })

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-md">
                Error loading agents: {error.message}
            </div>
        )
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Agents</h1>
                    <p className="text-slate-500 mt-1">Manage your real estate agents</p>
                </div>
                <Link
                    href="/admin/agents/new"
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition-colors"
                >
                    <Plus size={18} />
                    Add Agent
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {agents?.map((agent: any) => (
                    <div
                        key={agent.id}
                        className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            {agent.headshot_url ? (
                                <img
                                    src={agent.headshot_url}
                                    alt={agent.name}
                                    className="w-16 h-16 rounded-full object-cover border border-slate-100"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                    <User size={32} />
                                </div>
                            )}
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">
                                    {agent.name}
                                </h3>
                                <Link
                                    href={`/admin/agents/${agent.id}`}
                                    className="text-sm text-primary hover:underline"
                                >
                                    Edit Profile
                                </Link>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm text-slate-600">
                            {agent.email && (
                                <div className="flex items-center gap-2">
                                    <Mail size={14} className="text-slate-400" />
                                    {agent.email}
                                </div>
                            )}
                            {agent.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone size={14} className="text-slate-400" />
                                    {agent.phone}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {agents?.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-white rounded-lg border border-dashed border-slate-300">
                        <p className="text-slate-500 mb-4">No agents added yet.</p>
                        <Link
                            href="/admin/agents/new"
                            className="inline-flex items-center gap-2 text-slate-900 font-medium hover:underline"
                        >
                            <Plus size={18} />
                            Add your first agent
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
