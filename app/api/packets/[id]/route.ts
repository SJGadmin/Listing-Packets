import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// DELETE /api/packets/[id] - Delete a packet
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        await sql`DELETE FROM packets WHERE id = ${id}`

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}

// PUT /api/packets/[id] - Update a packet
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()

        await sql`
            UPDATE packets
            SET
                slug = ${body.slug},
                title = ${body.title},
                subtitle = ${body.subtitle},
                description = ${body.description},
                cover_image_url = ${body.cover_image_url},
                agent_id = ${body.agent_id},
                updated_at = NOW()
            WHERE id = ${id}
        `

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
