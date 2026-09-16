# Target Academy (آکادمی تیزهوشان تارگت)

Next.js 16 project for Target Academy in Qom - gifted school exam preparation for grades 4-6.

## Features

- **Course Catalog**: Browse courses with detailed information
- **Registration Flow**: Online and in-person modes, cash and installment payments
- **Consultation Requests**: Free consultation booking
- **Payment Integration**: Zarinpal payment gateway with mock mode for development
- **Admin Dashboard**: Manage courses, offerings, and installments (planned)
- **Persian/Farsi Support**: RTL layout, Jalali dates, Persian digits

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables (see SETUP.md)
cp .env.local.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Mock Payment Mode (Development)

For development without real Zarinpal credentials:

```env
# .env.local
PAYMENT_MODE=mock
# Or simply don't set ZARINPAL_MERCHANT_ID
```

This enables:
- Full registration flow testing without real gateway calls
- Orders persisted in Supabase with `status: 'pending'`
- Mock payment authorities (`MOCK_<timestamp>_<random>`)
- Success shown directly in modal (no redirect)
- All payment events logged in `payment_logs`

To switch to real Zarinpal mode:
1. Set `PAYMENT_MODE=real` (or remove the variable)
2. Add valid `ZARINPAL_MERCHANT_ID` and `NEXT_PUBLIC_SITE_URL`
3. Configure callback URL in Zarinpal merchant panel
4. No code changes required

## Documentation

- [Setup Guide](SETUP.md) - Complete installation and configuration
- [Supabase Schema](supabase-schema.sql) - Database schema
- [Migration Files](supabase-migration-phase1.sql) - Database migrations

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

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
│   │   ├── layout/        # Layout components
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

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Payments**: Zarinpal
- **Forms**: React Hook Form + Zod
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Deployment

### Vercel (Recommended)

1. Push to GitHub/GitLab
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## License

Private project - Target Academy (آکادمی تیزهوشان تارگت)