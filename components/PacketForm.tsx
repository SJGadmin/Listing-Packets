'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Packet, PacketItem } from '@/types'
import { Loader2, Plus, Trash2, GripVertical, Upload, FileText, Link as LinkIcon, Type } from 'lucide-react'
import clsx from 'clsx'
import { v4 as uuidv4 } from 'uuid'
import RichTextEditor from './RichTextEditor'

interface PacketFormProps {
    initialPacket?: Packet
    initialItems?: PacketItem[]
    isEditing?: boolean
    agents?: any[]
}

export default function PacketForm({ initialPacket, initialItems = [], isEditing = false, agents = [] }: PacketFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    // Packet State
    const [title, setTitle] = useState(initialPacket?.title || '')
    const [slug, setSlug] = useState(initialPacket?.slug || '')
    const [subtitle, setSubtitle] = useState(initialPacket?.subtitle || '')
    const [description, setDescription] = useState(initialPacket?.description || '')
    const [coverImageUrl, setCoverImageUrl] = useState(initialPacket?.cover_image_url || '')
    const [agentId, setAgentId] = useState(initialPacket?.agent_id || '')

    // Items State
    // We use a local ID for new items before they are saved to DB
    // If creating a new packet (not editing), add default items
    const getInitialItems = () => {
        if (initialItems.length > 0) {
            return initialItems.map(item => ({ ...item }))
        }

        // Default items for new packets
        if (!isEditing) {
            return [
                {
                    id: uuidv4(),
                    packet_id: '',
                    type: 'file' as const,
                    label: 'Offer Instructions',
                    order: 0,
                    created_at: new Date().toISOString(),
                    isNew: true
                },
                {
                    id: uuidv4(),
                    packet_id: '',
                    type: 'file' as const,
                    label: "Seller's Disclosure",
                    order: 1,
                    created_at: new Date().toISOString(),
                    isNew: true
                },
                {
                    id: uuidv4(),
                    packet_id: '',
                    type: 'file' as const,
                    label: 'MLS Listing',
                    order: 2,
                    created_at: new Date().toISOString(),
                    isNew: true
                },
                {
                    id: uuidv4(),
                    packet_id: '',
                    type: 'link' as const,
                    label: 'View the property on our website!',
                    order: 3,
                    created_at: new Date().toISOString(),
                    isNew: true
                },
                {
                    id: uuidv4(),
                    packet_id: '',
                    type: 'text' as const,
                    label: "What our seller's love about the property!",
                    order: 4,
                    created_at: new Date().toISOString(),
                    isNew: true
                }
            ]
        }

        return []
    }

    const [items, setItems] = useState<(PacketItem & { isNew?: boolean, file?: File })[]>(
        getInitialItems()
    )

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return

        const file = e.target.files[0]
        setLoading(true)

        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('folder', 'covers')

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                throw new Error('Upload failed')
            }

            const data = await response.json()
            setCoverImageUrl(data.url)
        } catch (error) {
            alert('Error uploading cover image')
        } finally {
            setLoading(false)
        }
    }

    const addItem = (type: 'file' | 'link' | 'text') => {
        const newItem: PacketItem & { isNew?: boolean } = {
            id: uuidv4(), // Temporary ID
            packet_id: initialPacket?.id || '', // Will be set on save if new
            type,
            label: '',
            order: items.length,
            created_at: new Date().toISOString(),
            isNew: true
        }
        setItems([...items, newItem])
    }

    const updateItem = (id: string, updates: Partial<PacketItem & { file?: File }>) => {
        setItems(items.map(item => item.id === id ? { ...item, ...updates } : item))
    }

    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id))
    }

    const moveItem = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return
        if (direction === 'down' && index === items.length - 1) return

        const newItems = [...items]
        const targetIndex = direction === 'up' ? index - 1 : index + 1

        // Swap
        const temp = newItems[index]
        newItems[index] = newItems[targetIndex]
        newItems[targetIndex] = temp

        // Update order
        newItems.forEach((item, idx) => item.order = idx)

        setItems(newItems)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // 1. Save Packet
            const packetData = {
                slug,
                title,
                subtitle,
                description,
                cover_image_url: coverImageUrl,
                agent_id: agentId || null,
            }

            let packetId = initialPacket?.id

            if (isEditing && packetId) {
                const response = await fetch(`/api/packets/${packetId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(packetData),
                })
                if (!response.ok) throw new Error('Failed to update packet')
            } else {
                const response = await fetch('/api/packets', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(packetData),
                })
                if (!response.ok) throw new Error('Failed to create packet')
                const data = await response.json()
                packetId = data.id
            }

            // 2. Handle Items - Upload files for file items
            const processedItems = await Promise.all(items.map(async (item, index) => {
                let url = item.url

                if (item.type === 'file' && item.file) {
                    const formData = new FormData()
                    formData.append('file', item.file)
                    formData.append('folder', `packets/${packetId}`)

                    const uploadResponse = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData,
                    })

                    if (!uploadResponse.ok) throw new Error('File upload failed')
                    const uploadData = await uploadResponse.json()
                    url = uploadData.url
                }

                return {
                    packet_id: packetId,
                    type: item.type,
                    label: item.label,
                    url,
                    content: item.content,
                    order: index
                }
            }))

            // 3. Save items via API
            const itemsResponse = await fetch('/api/packet-items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    packet_id: packetId,
                    items: processedItems
                }),
            })

            if (!itemsResponse.ok) throw new Error('Failed to save packet items')

            router.push('/admin')
            router.refresh()
        } catch (error: any) {
            alert(`Error saving packet: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 pb-20">
            {/* Packet Details */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-6">
                <h2 className="text-lg font-semibold text-slate-900">Packet Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Title</label>
                        <RichTextEditor
                            value={title}
                            onChange={setTitle}
                            placeholder="e.g. 123 Main St"
                            rows={2}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Slug (URL)</label>
                        <div className="flex">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm">
                                /p/
                            </span>
                            <input
                                type="text"
                                required
                                value={slug}
                                onChange={e => setSlug(e.target.value)}
                                className="flex-1 px-3 py-2 border border-slate-300 rounded-r-md focus:ring-2 focus:ring-slate-900 outline-none"
                                placeholder="123-main-st"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700">Subtitle (Optional)</label>
                        <RichTextEditor
                            value={subtitle}
                            onChange={setSubtitle}
                            placeholder="e.g. Showing Packet"
                            rows={2}
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700">Description (Optional)</label>
                        <RichTextEditor
                            value={description}
                            onChange={setDescription}
                            rows={4}
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700">Cover Image</label>
                        <div className="flex items-center gap-4">
                            {coverImageUrl && (
                                <img src={coverImageUrl} alt="Cover" className="h-20 w-32 object-cover rounded-md border border-slate-200" />
                            )}
                            <label className="cursor-pointer bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-md hover:bg-slate-50 transition-colors inline-flex items-center gap-2">
                                <Upload size={16} />
                                Upload Image
                                <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                            </label>
                        </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700">Assigned Agent (Optional)</label>
                        <select
                            value={agentId}
                            onChange={e => setAgentId(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 outline-none"
                        >
                            <option value="">No agent assigned</option>
                            {agents.map((agent: any) => (
                                <option key={agent.id} value={agent.id}>
                                    {agent.name}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-slate-500">Select the agent to display on this packet's public page.</p>
                    </div>
                </div>
            </div>

            {/* Packet Items */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900">Packet Items</h2>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => addItem('file')} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 rounded-md text-sm hover:bg-slate-50">
                            <FileText size={14} /> Add File
                        </button>
                        <button type="button" onClick={() => addItem('link')} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 rounded-md text-sm hover:bg-slate-50">
                            <LinkIcon size={14} /> Add Link
                        </button>
                        <button type="button" onClick={() => addItem('text')} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 rounded-md text-sm hover:bg-slate-50">
                            <Type size={14} /> Add Text
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    {items.map((item, index) => (
                        <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex gap-4 items-start">
                            <div className="flex flex-col gap-1 pt-2 text-slate-400">
                                <button type="button" onClick={() => moveItem(index, 'up')} disabled={index === 0} className="hover:text-slate-600 disabled:opacity-30">▲</button>
                                <GripVertical size={16} />
                                <button type="button" onClick={() => moveItem(index, 'down')} disabled={index === items.length - 1} className="hover:text-slate-600 disabled:opacity-30">▼</button>
                            </div>

                            <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                        {item.type}
                                    </span>
                                    <input
                                        type="text"
                                        value={item.label}
                                        onChange={e => updateItem(item.id, { label: e.target.value })}
                                        placeholder="Label (e.g. Seller's Disclosure)"
                                        className="flex-1 px-2 py-1 border-b border-transparent hover:border-slate-300 focus:border-slate-900 outline-none font-medium"
                                        required
                                    />
                                </div>

                                {item.type === 'file' && (
                                    <div className="flex items-center gap-4 text-sm">
                                        {item.url ? (
                                            <a href={item.url} target="_blank" className="text-blue-600 hover:underline truncate max-w-xs">{item.url.split('/').pop()}</a>
                                        ) : (
                                            <span className="text-slate-400 italic">No file uploaded</span>
                                        )}
                                        <label className="cursor-pointer text-slate-600 hover:text-slate-900 font-medium">
                                            {item.url ? 'Replace File' : 'Upload File'}
                                            <input type="file" onChange={e => e.target.files && updateItem(item.id, { file: e.target.files[0] })} className="hidden" />
                                        </label>
                                        {item.file && <span className="text-green-600 text-xs">New file selected: {item.file.name}</span>}
                                    </div>
                                )}

                                {item.type === 'link' && (
                                    <input
                                        type="url"
                                        value={item.url || ''}
                                        onChange={e => updateItem(item.id, { url: e.target.value })}
                                        placeholder="https://..."
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                                        required
                                    />
                                )}

                                {item.type === 'text' && (
                                    <RichTextEditor
                                        value={item.content || ''}
                                        onChange={(content) => updateItem(item.id, { content })}
                                        placeholder="Enter text content..."
                                        rows={4}
                                    />
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                className="text-slate-400 hover:text-red-600 transition-colors p-2"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}

                    {items.length === 0 && (
                        <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-slate-500">
                            No items yet. Add one above.
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="fixed bottom-0 left-0 md:left-64 right-0 p-4 bg-white border-t border-slate-200 flex items-center justify-end gap-4 z-10">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-slate-900 text-white px-6 py-2 rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    {loading && <Loader2 size={18} className="animate-spin" />}
                    {isEditing ? 'Save Changes' : 'Create Packet'}
                </button>
            </div>
        </form>
    )
}
