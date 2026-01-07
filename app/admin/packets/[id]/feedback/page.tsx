import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Star, Calendar, User } from 'lucide-react'
import { Prisma } from '@prisma/client'

type PacketFeedback = Prisma.PacketFeedbackGetPayload<{}>


export const dynamic = 'force-dynamic'

export default async function PacketFeedbackPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    // Fetch packet info with feedback
    const packet = await prisma.packet.findUnique({
        where: { id },
        select: {
            id: true,
            title: true,
            slug: true,
            feedback: {
                orderBy: {
                    created_at: 'desc'
                }
            }
        }
    })

    if (!packet) {
        notFound()
    }

    const feedbackList = packet.feedback

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={20}
                        className={`${
                            star <= rating
                                ? 'fill-yellow-400 stroke-yellow-500'
                                : 'fill-slate-200 stroke-slate-300'
                        }`}
                    />
                ))}
            </div>
        )
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/admin"
                    className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
                >
                    <ArrowLeft size={20} />
                    Back to Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-slate-900">Feedback</h1>
                <p className="text-slate-500 mt-1">
                    Viewing feedback for: <span className="font-medium text-slate-700">{packet.title}</span>
                </p>
            </div>

            {/* Feedback List */}
            <div className="space-y-4">
                {feedbackList && feedbackList.length > 0 ? (
                    feedbackList.map((feedback: PacketFeedback) => (
                        <div
                            key={feedback.id}
                            className="bg-white rounded-lg shadow-sm border border-slate-200 p-6"
                        >
                            {/* Header with name, date, and rating */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <User size={18} className="text-slate-400" />
                                        <h3 className="font-semibold text-slate-900">{feedback.agent_name}</h3>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <Calendar size={14} />
                                        {new Date(feedback.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                                <div className="ml-4">
                                    {renderStars(feedback.rating)}
                                </div>
                            </div>

                            {/* Feedback text */}
                            <div className="bg-slate-50 rounded-lg p-4">
                                <p className="text-slate-700 whitespace-pre-wrap">{feedback.feedback}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-lg border border-dashed border-slate-300 p-12 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Star size={32} className="text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">No feedback yet</h3>
                        <p className="text-slate-500">
                            Feedback from viewers will appear here once submitted.
                        </p>
                    </div>
                )}
            </div>

            {/* Stats Summary */}
            {feedbackList && feedbackList.length > 0 && (
                <div className="mt-8 bg-slate-50 rounded-lg p-6 border border-slate-200">
                    <h3 className="font-semibold text-slate-900 mb-4">Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Total Feedback</p>
                            <p className="text-2xl font-bold text-slate-900">{feedbackList.length}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Average Rating</p>
                            <div className="flex items-center gap-2">
                                <p className="text-2xl font-bold text-slate-900">
                                    {(feedbackList.reduce((acc: number, f: PacketFeedback) => acc + f.rating, 0) / feedbackList.length).toFixed(1)}
                                </p>
                                <Star size={20} className="fill-yellow-400 stroke-yellow-500" />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 mb-1">5 Star Reviews</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {feedbackList.filter((f: PacketFeedback) => f.rating === 5).length}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Latest</p>
                            <p className="text-sm font-medium text-slate-700">
                                {new Date(feedbackList[0].created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
