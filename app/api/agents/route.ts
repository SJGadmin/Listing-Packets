import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/agents - Create a new agent
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const { rows } = await sql`
            INSERT INTO agents (name, email, phone, headshot_url)
            VALUES (${body.name}, ${body.email}, ${body.phone}, ${body.headshot_url})
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

// GET /api/agents/[id] - Get a single agent
export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url)
        const id = url.searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 })
        }

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
