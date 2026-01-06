require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');
const fs = require('fs');
const path = require('path');

async function parseCsv(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',');

    const rows = [];
    for (let i = 1; i < lines.length; i++) {
        const values = [];
        let current = '';
        let inQuotes = false;

        for (let char of lines[i]) {
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current);

        const row = {};
        headers.forEach((header, index) => {
            let value = values[index];
            if (value === '' || value === 'NULL') {
                value = null;
            }
            row[header] = value;
        });
        rows.push(row);
    }

    return rows;
}

async function importData() {
    try {
        console.log('Starting data import...');

        // Import agents first (referenced by packets)
        console.log('Importing agents...');
        const agents = await parseCsv(path.join(__dirname, 'Supabase_Backup/agents_rows.csv'));
        for (const agent of agents) {
            await sql`
                INSERT INTO agents (id, name, phone, email, headshot_url, created_at, updated_at)
                VALUES (${agent.id}, ${agent.name}, ${agent.phone}, ${agent.email}, ${agent.headshot_url}, ${agent.created_at}, ${agent.updated_at})
                ON CONFLICT (id) DO NOTHING
            `;
        }
        console.log(`✓ Imported ${agents.length} agents`);

        // Import packets
        console.log('Importing packets...');
        const packets = await parseCsv(path.join(__dirname, 'Supabase_Backup/packets_rows.csv'));
        for (const packet of packets) {
            await sql`
                INSERT INTO packets (id, slug, title, subtitle, description, cover_image_url, agent_id, created_at, updated_at)
                VALUES (${packet.id}, ${packet.slug}, ${packet.title}, ${packet.subtitle}, ${packet.description}, ${packet.cover_image_url}, ${packet.agent_id}, ${packet.created_at}, ${packet.updated_at})
                ON CONFLICT (id) DO NOTHING
            `;
        }
        console.log(`✓ Imported ${packets.length} packets`);

        // Import packet items
        console.log('Importing packet items...');
        const items = await parseCsv(path.join(__dirname, 'Supabase_Backup/packet_items_rows.csv'));
        for (const item of items) {
            await sql`
                INSERT INTO packet_items (id, packet_id, type, label, url, content, "order", created_at)
                VALUES (${item.id}, ${item.packet_id}, ${item.type}, ${item.label}, ${item.url}, ${item.content}, ${item.order}, ${item.created_at})
                ON CONFLICT (id) DO NOTHING
            `;
        }
        console.log(`✓ Imported ${items.length} packet items`);

        // Import packet views
        console.log('Importing packet views...');
        const views = await parseCsv(path.join(__dirname, 'Supabase_Backup/packet_views_rows.csv'));
        for (const view of views) {
            await sql`
                INSERT INTO packet_views (id, packet_id, user_agent, ip_hash, created_at)
                VALUES (${view.id}, ${view.packet_id}, ${view.user_agent}, ${view.ip_hash}, ${view.created_at})
                ON CONFLICT (id) DO NOTHING
            `;
        }
        console.log(`✓ Imported ${views.length} packet views`);

        // Import feedback
        console.log('Importing feedback...');
        const feedback = await parseCsv(path.join(__dirname, 'Supabase_Backup/packet_feedback_rows.csv'));
        for (const fb of feedback) {
            await sql`
                INSERT INTO packet_feedback (id, packet_id, agent_name, feedback, rating, created_at)
                VALUES (${fb.id}, ${fb.packet_id}, ${fb.agent_name}, ${fb.feedback}, ${fb.rating}, ${fb.created_at})
                ON CONFLICT (id) DO NOTHING
            `;
        }
        console.log(`✓ Imported ${feedback.length} feedback entries`);

        console.log('\n✓ Data import completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error importing data:', error);
        process.exit(1);
    }
}

importData();
