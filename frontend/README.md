# Samba Service - Frontend

Next.js 14 frontend for the Samba Service multi-store e-commerce platform.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Form Handling**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Mapping**: React Leaflet

## Setup

1. Navigate to `frontend/` directory
2. Copy `.env.example` to `.env.local`
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (customer)/        # Customer-facing pages
│   ├── (admin)/           # Store admin pages
│   └── (superadmin)/      # Super admin pages
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities, API client, Redux store
└── public/                # Static assets
```

## Available Pages

- `/` - Landing page
- `/login` - Login page
- `/register` - Registration page
- `/stores` - Browse stores
- `/dashboard` - Customer dashboard
- `/admin/dashboard` - Store admin dashboard
- `/superadmin/dashboard` - Super admin dashboard
