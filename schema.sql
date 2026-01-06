-- Vercel Postgres Schema for Packets App

-- Create Agents table first (referenced by packets)
CREATE TABLE agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  headshot_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Packets table
CREATE TABLE packets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  cover_image_url TEXT,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Packet Items table
CREATE TABLE packet_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  packet_id UUID REFERENCES packets(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('file', 'link', 'text')),
  label TEXT NOT NULL,
  url TEXT,
  content TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Packet Views table
CREATE TABLE packet_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  packet_id UUID REFERENCES packets(id) ON DELETE CASCADE NOT NULL,
  user_agent TEXT,
  ip_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Packet Feedback table
CREATE TABLE packet_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  packet_id UUID REFERENCES packets(id) ON DELETE CASCADE NOT NULL,
  agent_name TEXT NOT NULL,
  feedback TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_packets_slug ON packets(slug);
CREATE INDEX idx_packets_agent_id ON packets(agent_id);
CREATE INDEX idx_packet_items_packet_id ON packet_items(packet_id);
CREATE INDEX idx_packet_items_order ON packet_items(packet_id, "order");
CREATE INDEX idx_packet_views_packet_id ON packet_views(packet_id);
CREATE INDEX idx_packet_feedback_packet_id ON packet_feedback(packet_id);
