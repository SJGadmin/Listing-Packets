import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/packet-items - Create packet items
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { packet_id, items } = body

        // Delete existing items first
        await sql`DELETE FROM packet_items WHERE packet_id = ${packet_id}`

        // Insert new items
        for (const item of items) {
            await sql`
                INSERT INTO packet_items (packet_id, type, label, url, content, "order")
                VALUES (${packet_id}, ${item.type}, ${item.label}, ${item.url}, ${item.content}, ${item.order})
            `
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
