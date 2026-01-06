import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/agents - Create a new agent
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const agent = await prisma.agent.create({
            data: {
                name: body.name,
                email: body.email || null,
                phone: body.phone || null,
                headshot_url: body.headshot_url || null
            }
        })

        return NextResponse.json({ id: agent.id })
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

        const agent = await prisma.agent.findUnique({
            where: { id }
        })

        if (!agent) {
            return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
        }

        return NextResponse.json(agent)
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
