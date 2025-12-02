# Stewart & Jane Packets

A custom "packet builder" application for Stewart & Jane Group. Create and share beautiful, branded collections of documents and links.

## Features

- **Admin Dashboard**: Password-protected area to manage packets.
- **Packet Builder**: Create packets with title, cover image, and items.
- **Packet Items**: Add Files (PDFs/Images), Links (3D tours, etc.), and Text notes.
- **Public View**: Beautiful, responsive page for clients to view packets.
- **Analytics**: Basic view counting and Meta Pixel integration.

## Setup

### 1. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=your_pixel_id_optional
```

### 2. Supabase Setup

1. Create a new Supabase project.
2. Go to the SQL Editor and run the contents of `supabase/schema.sql`.
   - This will create the tables (`packets`, `packet_items`, `packet_views`) and the storage bucket (`packet-assets`).
   - It also sets up Row Level Security (RLS) policies.

### 3. Run Locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000/admin` to log in.
**Password**: `WhoisJane!59`

## Deployment (Vercel)

1. Push this code to a GitHub repository.
2. Import the project into Vercel.
3. Add the Environment Variables in Vercel project settings.
4. Deploy!

## Customization

- **Branding**: Edit `app/globals.css` to change the `--color-primary`.
- **Logo**: Update `app/p/[slug]/page.tsx` to point to your actual logo image.
- **Contact Info**: Update the footer in `app/p/[slug]/page.tsx`.

## Tech Stack

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Postgres + Storage)
