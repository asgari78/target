# Dyso (Target Academy) - Setup Guide

## Prerequisites

- **Node.js**: v20.x or higher
- **Package Manager**: npm (v10+), pnpm, yarn, or bun
- **Supabase Account**: For database and authentication
- **Zarinpal Merchant Account**: For payment processing (Iran)

## Installing Dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (public) | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public API key | `eyJhbGciOiJIUzI1NiIs...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only, keep secret!) | `eyJhbGciOiJIUzI1NiIs...` |
| `ZARINPAL_MERCHANT_ID` | Zarinpal merchant ID from your merchant panel | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `NEXT_PUBLIC_SITE_URL` | Base URL of your site (used for payment callbacks) | `https://yourdomain.com` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ZARINPAL_SANDBOX` | Use Zarinpal sandbox environment for testing | `false` |

### Example `.env.local`

```env
# Supabase (Public - safe to expose to browser)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase (Server-only - NEVER expose to browser)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Zarinpal Payment Gateway
ZARINPAL_MERCHANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
ZARINPAL_SANDBOX=true
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

**⚠️ Security Note**: Never commit `.env.local` to version control. The `SUPABASE_SERVICE_ROLE_KEY` must only be used in server-side code (API routes, server actions).

## Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Run TypeScript type checking |

## Database Setup (Supabase)

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down the **Project URL** and **API Keys** (anon/public and service_role)

### 2. Run Migrations
The project includes SQL migration files in the root directory. Apply them in order:

```bash
# Using Supabase CLI (recommended)
supabase db push

# Or manually run in Supabase SQL Editor in this order:
# 1. supabase-migration-phase1.sql
# 2. supabase-migration-phase2.sql
# 3. supabase-migration-phase3.sql
# 4. supabase-schema.sql (complete schema)
```

### 3. Configure Supabase Settings
- **Authentication**: Enable email/password or other providers as needed
- **Storage**: Create buckets for course images, instructor photos, etc.
- **Row Level Security**: Policies are included in migrations

### 4. Storage Buckets (if needed)
Create the following buckets in Supabase Storage:
- `course-images` - For course cover images
- `instructor-images` - For instructor profile photos
- `logo` - For site logo

## Zarinpal Payment Gateway Setup

### 1. Get Merchant ID
1. Register at [Zarinpal](https://www.zarinpal.com/)
2. Complete merchant verification
3. Get your Merchant ID from the merchant panel

### 2. Configure Callback URL
In Zarinpal merchant panel, set the callback URL to:
```
https://yourdomain.com/api/payments/zarinpal/callback
```

### 3. Test with Sandbox
Set `ZARINPAL_SANDBOX=true` in `.env.local` for testing:
- Sandbox Merchant ID: Use the test ID from Zarinpal docs
- Test card numbers available in Zarinpal documentation

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── consultations/ # Consultation requests
│   │   ├── orders/        # Order creation & payment initiation
│   │   ├── payments/zarinpal/callback/ # Zarinpal callback handler
│   │   └── reservations/  # Free reservations
│   ├── page.tsx           # Home page
│   └── layout.tsx         # Root layout
├── src/
│   ├── components/        # React components
│   │   ├── layout/        # Layout components (Header, Footer, HeroSlider, etc.)
│   │   ├── modal/         # Modal components (Registration, CourseDetail)
│   │   └── ui/            # Base UI components
│   ├── lib/               # Utility functions
│   │   ├── pricing.ts     # Pricing calculations
│   │   ├── utils.ts       # General utilities
│   │   ├── validations.ts # Zod validation schemas
│   │   └── server/        # Server-only code
│   │       ├── supabaseAdmin.ts  # Supabase admin client
│   │       └── zarinpal.ts       # Zarinpal payment integration
│   └── types/             # TypeScript types
├── supabase-*.sql         # Database migration files
└── public/                # Static assets
```

## Key Features

- **Course Registration**: Online and in-person modes
- **Payment Modes**: Cash (full payment) and Installments
- **Zarinpal Integration**: Secure payment processing
- **Reservation System**: Free reservations for courses
- **Consultation Requests**: Free consultation booking
- **Responsive Design**: Mobile-first with Tailwind CSS
- **Persian/Farsi Support**: RTL layout, Jalali dates, Persian digits

## Deployment

### Vercel (Recommended)
1. Push to GitHub/GitLab
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables for Production
Ensure all required environment variables are set in your hosting platform.

## Troubleshooting

### Build Fails with "Missing Zarinpal or site URL"
- Ensure `ZARINPAL_MERCHANT_ID` and `NEXT_PUBLIC_SITE_URL` are set in `.env.local`
- For production builds, set these in your hosting platform's environment variables

### Supabase Connection Errors
- Verify `NEXT_PUBLIC_SUPABASE_URL` and keys are correct
- Check Supabase project is not paused
- Ensure RLS policies allow the operations

### Payment Callback Issues
- Verify callback URL matches exactly in Zarinpal panel
- Check `NEXT_PUBLIC_SITE_URL` includes protocol (https://)
- Review server logs for Zarinpal API errors

## License

Private project - Target Academy (Dyso)