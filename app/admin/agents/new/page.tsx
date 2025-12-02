'use client'

import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'

export default function NewAgentPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const name = formData.get('name') as string
        const email = formData.get('email') as string
        const phone = formData.get('phone') as string
        const headshot_url = formData.get('headshot_url') as string

        const supabase = createClient()

        const { error: insertError } = await supabase
            .from('agents')
            .insert({
                name,
                email: email || null,
                phone: phone || null,
                headshot_url: headshot_url || null,
            })

        if (insertError) {
            setError(insertError.message)
            setLoading(false)
            return
        }

        router.push('/admin/agents')
        router.refresh()
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
                    <h1 className="text-2xl font-bold text-slate-900">New Agent</h1>
                    <p className="text-slate-500 mt-1">Add a new real estate agent</p>
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
                        required
                        className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                        placeholder="e.g. Jane Doe"
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
                            className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                            placeholder="jane@example.com"
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
                            className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                            placeholder="(555) 123-4567"
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
                        className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                        placeholder="https://example.com/headshot.jpg"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                        Enter a direct link to the agent's headshot image.
                    </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
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
                                Create Agent
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
