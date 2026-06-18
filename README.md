# The Academy of Natural Wellness (ANW Academy)

> "Where ancient wisdom meets modern mastery."

A full-stack Next.js university platform for natural wellness education — covering Herbal Medicine, Traditional Chinese Medicine, Homeopathic Studies, Functional Wellness, Practice Building, and Wellness Entrepreneurship.

## Tech Stack

- **Next.js 16** App Router with TypeScript strict mode
- **Tailwind CSS** with custom ANW design tokens
- **Prisma ORM v7** with PostgreSQL (Supabase)
- **Supabase Auth** for authentication and session management
- **Anthropic SDK** (`@anthropic-ai/sdk`) for the ANW Scholar AI tutor
- **Lucide React** for icons

## Features

- 6 Schools — Herbal Medicine, TCM, Homeopathic Studies, Functional Wellness, Practice Building, Wellness Entrepreneurship
- 48 Courses — 8 per school, with modules, lessons, quizzes, assignments, and discussions
- 8 Certifications — From Foundations to Senior Natural Wellness Practitioner
- Wellness Units (WU) — Progress currency earned through all learning activities
- ANW Scholar — AI learning companion powered by Claude
- Practitioner Network — Public directory of verified ANW graduates
- Admin Dashboard — Applications, students, schools, analytics
- Practitioner Portal — Client management, continuing education, directory profile

## Setup

### Prerequisites

- Node.js 18+
- Supabase account with a Postgres database
- Anthropic API key

### 1. Clone and Install

```bash
git clone <repo-url>
cd anw-academy
npm install
```

### 2. Configure Environment

Fill in `.env.local` with your credentials:

```
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ANTHROPIC_API_KEY=sk-ant-...
NEXTAUTH_SECRET=...
```

### 3. Set Up Database

```bash
npx prisma db push
npx prisma db seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Project Structure

```
anw-academy/
├── app/
│   ├── (public)/          # Public marketing pages
│   ├── (auth)/            # Login / Register
│   ├── (student)/         # Student dashboard
│   ├── (practitioner)/    # Practitioner portal
│   ├── (admin)/           # Admin control panel
│   └── api/               # API routes (AI tutor, auth callback)
├── components/
│   ├── shared/            # Reusable UI components
│   ├── dashboard/         # Student dashboard components
│   ├── admin/             # Admin components
│   └── practitioner/      # Practitioner components
├── lib/
│   ├── prisma.ts          # Prisma client
│   ├── utils.ts           # Utility functions
│   └── supabase/          # Supabase clients
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
└── prisma.config.ts       # Prisma v7 configuration
```

## Seeded Accounts

| Role | Email |
|------|-------|
| Admin | admin@anwacademy.com |
| Student | emma.clarke@student.com |
| Practitioner | evelyn.hartwood@practitioner.com |

## Wellness Unit System

| Activity | WU Earned |
|----------|-----------|
| Lesson completed | 1 WU |
| Quiz passed | 2 WU |
| Discussion post | 2 WU |
| Assignment submitted | 5 WU |
| Case study approved | 10-25 WU |
| Capstone project | 50 WU |

## Deployment

```bash
vercel --prod
```

Set all environment variables in your Vercel project settings.

## Educational Disclaimer

The Academy of Natural Wellness provides educational content for informational purposes only. Programs do not confer licensed medical qualifications. Graduates are wellness educators, not licensed healthcare practitioners.
