# Shree Jewellers: Digital Catalogue Demo (by LacsoHub)

A mobile-first jewellery catalogue for traditional Ahmedabad jewellers. Customers browse designs and enquire on **WhatsApp**. There is no cart, checkout, payment or customer sign-up.

Stack: React + Vite + Tailwind CSS 3, React Router, Lucide, Framer Motion, Supabase (optional).

## Quick start

```bash
npm install
cp .env.example .env     # optional; leave blank for local demo mode
npm run dev              # http://localhost:5173
npm run build && npm run preview
```

## Two modes

| Mode | When | Data |
|---|---|---|
| **Local demo** | `.env` has no Supabase keys | 30 sample designs; edits saved in the browser's localStorage only. **Not production-persistent.** Admin password: `demo1234` |
| **Supabase** | `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` set | Real Auth, PostgreSQL and Storage with row-level security |

Local demo mode is labelled in the Admin and footer. Use Admin > "Reset demo data" to restore the samples.

## Supabase setup

1. Create a project at supabase.com.
2. SQL Editor: run `supabase/schema.sql` (tables, RLS policies, storage bucket `product-images`, starter categories).
3. Optional: run `supabase/seed_sample_products.sql` for the 30 sample designs.
4. Authentication > Providers > Email: **disable "Allow new users to sign up"**, then add the owner under Authentication > Users (email and password). Any signed-in user can edit, so keep sign-ups off.
5. Put the project URL and anon key in `.env`.
6. Open `/admin`, sign in, then fill Shop info (WhatsApp number etc.).

Security: the anon key is public by design; safety comes from RLS. Visitors can read visible products only; only authenticated users can write or upload.

## Using real content

- **Photographs:** no photos are bundled. Upload only images you own or are licensed to use (Admin > Designs, and Shop info for the hero necklace photo). Until then, clearly marked placeholders show.
- **WhatsApp number:** digits with country code (e.g. `91XXXXXXXXXX`) in Admin > Shop info or `VITE_WHATSAPP_NUMBER`. Left blank in the demo; WhatsApp then asks you to pick a contact.
- **Prices:** hidden by default, none invented. Enable in Admin > Shop info, and only designs with a price show one.
- **About / Contact:** all editable from Admin > Shop info. No history, awards or reviews are claimed.

## Demo features (all labelled in the UI)

"Demo by LacsoHub" bar, 60-second tour, retailer/wholesaler view switch, sample designs, local admin preview.

## Deployment

Build output is `dist/`. Single-page-app rewrites are included.

- **Vercel:** import the repo; framework Vite; add the env vars. `vercel.json` is included.
- **Netlify:** build `npm run build`, publish `dist`; `public/_redirects` is included.
- **Cloudflare Pages:** build `npm run build`, output `dist`; add a `/* /index.html 200` rule if needed.

Add the `VITE_*` variables in the host's settings, then redeploy.

## Structure

```
src/components  Layout, Walkthrough, ProductCard, ProductImage, Illustrations (inline SVG sketches)
src/pages       Home, Collections, Product, About, Contact, Admin
src/lib         store (Supabase or local), supabase client, whatsapp helpers
src/data        sample products, default shop info
supabase/       schema.sql, seed_sample_products.sql
```
