import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/agents/[id] - Get a single agent
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

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

// PUT /api/agents/[id] - Update an agent
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()

        await prisma.agent.update({
            where: { id },
            data: {
                name: body.name,
                email: body.email || null,
                phone: body.phone || null,
                headshot_url: body.headshot_url || null,
                updated_at: new Date()
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

// DELETE /api/agents/[id] - Delete an agent
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        await prisma.agent.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
