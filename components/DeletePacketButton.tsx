'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Trash2 } from 'lucide-react'

export default function DeletePacketButton({ packetId, packetTitle }: { packetId: string, packetTitle: string }) {
    const [showConfirm, setShowConfirm] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        setIsDeleting(true)
        const supabase = createClient()

        const { error } = await supabase
            .from('packets')
            .delete()
            .eq('id', packetId)

        if (error) {
            alert('Failed to delete packet: ' + error.message)
            setIsDeleting(false)
            return
        }

        router.refresh()
    }

    if (showConfirm) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Packet?</h3>
                    <p className="text-slate-600 mb-4">
                        Are you sure you want to delete <span className="font-semibold">"{packetTitle}"</span>? This action cannot be undone.
                    </p>
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={() => setShowConfirm(false)}
                            disabled={isDeleting}
                            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-md hover:bg-slate-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <button
            onClick={() => setShowConfirm(true)}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Delete Packet"
        >
            <Trash2 size={20} />
        </button>
    )
}
