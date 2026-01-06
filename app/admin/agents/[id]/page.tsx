'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, Trash2 } from 'lucide-react'
import { use } from 'react'

export default function EditAgentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [agent, setAgent] = useState<any>(null)

    useEffect(() => {
        async function fetchAgent() {
            try {
                const response = await fetch(`/api/agents/${id}`)
                if (!response.ok) {
                    throw new Error('Failed to load agent')
                }
                const data = await response.json()
                setAgent(data)
            } catch (err) {
                setError('Failed to load agent')
            } finally {
                setFetching(false)
            }
        }

        fetchAgent()
    }, [id])

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const name = formData.get('name') as string
        const email = formData.get('email') as string
        const phone = formData.get('phone') as string
        const headshot_url = formData.get('headshot_url') as string

        try {
            const response = await fetch(`/api/agents/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email: email || null,
                    phone: phone || null,
                    headshot_url: headshot_url || null,
                }),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to update agent')
            }

            router.push('/admin/agents')
            router.refresh()
        } catch (err: any) {
            setError(err.message)
            setLoading(false)
        }
    }

    async function handleDelete() {
        if (!confirm('Are you sure you want to delete this agent?')) return

        setLoading(true)
        try {
            const response = await fetch(`/api/agents/${id}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to delete agent')
            }

            router.push('/admin/agents')
            router.refresh()
        } catch (err: any) {
            setError(err.message)
            setLoading(false)
        }
    }

    if (fetching) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 size={32} className="animate-spin text-slate-400" />
            </div>
        )
    }

    if (!agent) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-md">
                Agent not found
            </div>
        )
    }

    return (
        <div>
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href="/admin/agents"
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={20} className="text-slate-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Edit Agent</h1>
                    <p className="text-slate-500 mt-1">Update agent information</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-2xl bg-white p-8 rounded-lg shadow-sm border border-slate-200 space-y-6">
                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-md text-sm">
                        {error}
                    </div>
                )}

                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        defaultValue={agent.name}
                        required
                        className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            defaultValue={agent.email || ''}
                            className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            id="phone"
                            defaultValue={agent.phone || ''}
                            className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="headshot_url" className="block text-sm font-medium text-slate-700 mb-1">
                        Headshot URL
                    </label>
                    <input
                        type="url"
                        name="headshot_url"
                        id="headshot_url"
                        defaultValue={agent.headshot_url || ''}
                        className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    />
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-md transition-colors"
                    >
                        <Trash2 size={18} />
                        Delete Agent
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2 rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
