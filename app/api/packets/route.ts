import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/packets - Create a new packet
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const { rows } = await sql`
            INSERT INTO packets (slug, title, subtitle, description, cover_image_url, agent_id)
            VALUES (${body.slug}, ${body.title}, ${body.subtitle}, ${body.description}, ${body.cover_image_url}, ${body.agent_id})
            RETURNING id
        `

        return NextResponse.json({ id: rows[0].id })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
