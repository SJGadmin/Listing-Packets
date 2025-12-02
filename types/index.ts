export type PacketType = 'file' | 'link' | 'text';

export interface Packet {
    id: string;
    slug: string;
    title: string;
    subtitle?: string;
    description?: string;
    cover_image_url?: string;
    created_at: string;
    updated_at: string;
}

export interface PacketItem {
    id: string;
    packet_id: string;
    type: PacketType;
    label: string;
    url?: string;
    content?: string;
    order: number;
    created_at: string;
}

export interface PacketView {
    id: string;
    packet_id: string;
    created_at: string;
    user_agent?: string;
    ip_hash?: string;
}
