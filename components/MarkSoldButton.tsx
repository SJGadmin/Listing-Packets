'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'

export default function MarkSoldButton({ packetId, packetTitle }: { packetId: string, packetTitle: string }) {
    const [showConfirm, setShowConfirm] = useState(false)
    const [isMarking, setIsMarking] = useState(false)
    const router = useRouter()

    const handleMarkSold = async () => {
        setIsMarking(true)

        try {
            const response = await fetch(`/api/packets/${packetId}/sold`, {
                method: 'POST',
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to mark as sold')
            }

            router.refresh()
            setShowConfirm(false)
        } catch (error: any) {
            alert('Failed to mark as sold: ' + error.message)
            setIsMarking(false)
        }
    }

    if (showConfirm) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Mark as Sold?</h3>
                    <p className="text-slate-600 mb-4">
                        Are you sure you want to mark <span className="font-semibold">"{packetTitle}"</span> as sold?
                    </p>
                    <p className="text-sm text-slate-500 mb-4">
                        This will remove the packet from public view and delete all associated files, views, and feedback. Only the property name will be retained.
                    </p>
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={() => setShowConfirm(false)}
                            disabled={isMarking}
                            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-md hover:bg-slate-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleMarkSold}
                            disabled={isMarking}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            {isMarking ? 'Marking...' : 'Mark as Sold'}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <button
            onClick={() => setShowConfirm(true)}
            className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
            title="Mark as Sold"
        >
            <CheckCircle size={20} />
        </button>
    )
}
