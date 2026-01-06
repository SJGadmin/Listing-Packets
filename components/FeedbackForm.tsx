'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

export default function FeedbackForm({ packetId }: { packetId: string }) {
    const [agentName, setAgentName] = useState('')
    const [feedback, setFeedback] = useState('')
    const [rating, setRating] = useState(0)
    const [hoveredRating, setHoveredRating] = useState(0)
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!agentName || !feedback || rating === 0) {
            setError('Please fill in all fields and select a rating')
            return
        }

        setLoading(true)
        setError('')

        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    packet_id: packetId,
                    agent_name: agentName,
                    feedback: feedback,
                    rating: rating
                })
            })

            if (!response.ok) {
                throw new Error('Failed to submit feedback')
            }

            setSubmitted(true)
        } catch (error) {
            setError('Failed to submit feedback. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (submitted) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Thank you for your feedback!</h3>
                <p className="text-slate-600">We appreciate you taking the time to share your thoughts.</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Share Your Feedback</h3>
            <p className="text-slate-600 mb-6">We'd love to hear about your experience viewing this listing.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Agent Name */}
                <div>
                    <label htmlFor="agentName" className="block text-sm font-medium text-slate-700 mb-2">
                        Your Name
                    </label>
                    <input
                        type="text"
                        id="agentName"
                        value={agentName}
                        onChange={(e) => setAgentName(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                        placeholder="e.g. John Smith"
                        required
                    />
                </div>

                {/* Rating */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Rating
                    </label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-slate-900 rounded"
                            >
                                <Star
                                    size={40}
                                    className={`${
                                        star <= (hoveredRating || rating)
                                            ? 'fill-yellow-400 stroke-yellow-500'
                                            : 'fill-slate-200 stroke-slate-300'
                                    } transition-colors`}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Feedback */}
                <div>
                    <label htmlFor="feedback" className="block text-sm font-medium text-slate-700 mb-2">
                        Your Feedback
                    </label>
                    <textarea
                        id="feedback"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none resize-none"
                        placeholder="Tell us what you thought about this listing..."
                        required
                    />
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Submitting...' : 'Submit Feedback'}
                </button>
            </form>
        </div>
    )
}
