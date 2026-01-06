import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/packets - Create a new packet
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const packet = await prisma.packet.create({
            data: {
                slug: body.slug,
                title: body.title,
                subtitle: body.subtitle,
                description: body.description,
                cover_image_url: body.cover_image_url,
                agent_id: body.agent_id || null
            }
        })

        return NextResponse.json({ id: packet.id })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
