This is a Next.js (App Router) project using Supabase for backend (Storage, auth). It includes a JPG → PDF converter and uploads PDFs to Supabase Storage.

## Getting Started

First, install dependencies, configure env, then run the development server:

```bash
npm install

# Create .env.local
cat > .env.local <<'EOF'
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
# Optional (server-side privileged ops in dev only)
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_BUCKET=documents
EOF

npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

In Supabase → Storage, create a bucket named `documents` (or change `NEXT_PUBLIC_SUPABASE_BUCKET`). Set it to public or add a policy that allows read access.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
