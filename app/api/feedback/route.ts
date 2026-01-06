import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/feedback - Submit feedback
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        await sql`
            INSERT INTO packet_feedback (packet_id, agent_name, feedback, rating)
            VALUES (${body.packet_id}, ${body.agent_name}, ${body.feedback}, ${body.rating})
        `

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
