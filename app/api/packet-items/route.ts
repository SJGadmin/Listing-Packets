import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/packet-items - Create packet items
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { packet_id, items } = body

        // Delete existing items and create new ones in a transaction
        await prisma.$transaction([
            prisma.packetItem.deleteMany({
                where: { packet_id }
            }),
            prisma.packetItem.createMany({
                data: items.map((item: any) => ({
                    packet_id,
                    type: item.type,
                    label: item.label,
                    url: item.url || null,
                    content: item.content || null,
                    order: item.order
                }))
            })
        ])

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
