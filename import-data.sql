-- Import agents
\copy agents(id, name, phone, email, headshot_url, created_at, updated_at) FROM 'Supabase_Backup/agents_rows.csv' WITH (FORMAT csv, HEADER true, NULL 'NULL');

-- Import packets
\copy packets(id, slug, title, subtitle, description, cover_image_url, created_at, updated_at, agent_id) FROM 'Supabase_Backup/packets_rows.csv' WITH (FORMAT csv, HEADER true, NULL 'NULL');

-- Import packet items
\copy packet_items(id, packet_id, type, label, url, content, "order", created_at) FROM 'Supabase_Backup/packet_items_rows.csv' WITH (FORMAT csv, HEADER true, NULL 'NULL');

-- Import packet views
\copy packet_views(id, packet_id, user_agent, ip_hash, created_at) FROM 'Supabase_Backup/packet_views_rows.csv' WITH (FORMAT csv, HEADER true, NULL 'NULL');

-- Import feedback
\copy packet_feedback(id, packet_id, agent_name, feedback, rating, created_at) FROM 'Supabase_Backup/packet_feedback_rows.csv' WITH (FORMAT csv, HEADER true, NULL 'NULL');
