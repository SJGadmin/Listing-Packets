import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/feedback - Submit feedback
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        await prisma.packetFeedback.create({
            data: {
                packet_id: body.packet_id,
                agent_name: body.agent_name,
                feedback: body.feedback,
                rating: body.rating
            }
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
