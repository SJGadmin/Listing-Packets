import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/agents/[id] - Get a single agent
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const { rows } = await sql`
            SELECT * FROM agents WHERE id = ${id}
        `

        if (rows.length === 0) {
            return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
        }

        return NextResponse.json(rows[0])
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}

// PUT /api/agents/[id] - Update an agent
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()

        await sql`
            UPDATE agents
            SET
                name = ${body.name},
                email = ${body.email},
                phone = ${body.phone},
                headshot_url = ${body.headshot_url},
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

// DELETE /api/agents/[id] - Delete an agent
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        await sql`DELETE FROM agents WHERE id = ${id}`

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
