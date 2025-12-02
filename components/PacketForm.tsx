'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
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
    const supabase = createClient()
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
    const [items, setItems] = useState<(PacketItem & { isNew?: boolean, file?: File })[]>(
        initialItems.map(item => ({ ...item }))
    )

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return

        const file = e.target.files[0]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `covers/${fileName}`

        setLoading(true)
        const { error: uploadError } = await supabase.storage
            .from('packet-assets')
            .upload(filePath, file)

        if (uploadError) {
            alert('Error uploading cover image')
            setLoading(false)
            return
        }

        const { data: { publicUrl } } = supabase.storage
            .from('packet-assets')
            .getPublicUrl(filePath)

        setCoverImageUrl(publicUrl)
        setLoading(false)
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
                updated_at: new Date().toISOString()
            }

            let packetId = initialPacket?.id

            if (isEditing && packetId) {
                const { error } = await supabase
                    .from('packets')
                    .update(packetData)
                    .eq('id', packetId)
                if (error) throw error
            } else {
                const { data, error } = await supabase
                    .from('packets')
                    .insert([packetData])
                    .select()
                    .single()
                if (error) throw error
                packetId = data.id
            }

            // 2. Handle Items
            // Upload files for new file items
            const processedItems = await Promise.all(items.map(async (item, index) => {
                let url = item.url

                if (item.type === 'file' && item.file) {
                    const fileExt = item.file.name.split('.').pop()
                    const fileName = `${packetId}/${Math.random()}.${fileExt}`
                    const { error: uploadError } = await supabase.storage
                        .from('packet-assets')
                        .upload(fileName, item.file)

                    if (uploadError) throw uploadError

                    const { data: { publicUrl } } = supabase.storage
                        .from('packet-assets')
                        .getPublicUrl(fileName)

                    url = publicUrl
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

            // Delete existing items for this packet (simplest way to handle reordering/deletions)
            if (isEditing && packetId) {
                await supabase.from('packet_items').delete().eq('packet_id', packetId)
            }

            // Insert all items
            if (processedItems.length > 0) {
                const { error: itemsError } = await supabase
                    .from('packet_items')
                    .insert(processedItems)
                if (itemsError) throw itemsError
            }

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
