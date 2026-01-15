import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/packets/[id]/sold - Mark a packet as sold and clean up data
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // Use a transaction to mark as sold and delete related data
        await prisma.$transaction([
            // Delete related items, views, and feedback
            prisma.packetItem.deleteMany({ where: { packet_id: id } }),
            prisma.packetView.deleteMany({ where: { packet_id: id } }),
            prisma.packetFeedback.deleteMany({ where: { packet_id: id } }),
            // Update packet: set sold_at and clear data fields
            prisma.packet.update({
                where: { id },
                data: {
                    sold_at: new Date(),
                    subtitle: null,
                    description: null,
                    cover_image_url: null,
                    updated_at: new Date()
                }
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
