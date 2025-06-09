# Bike Rental Platform

A modern, accessible, and sustainable bike rental platform for educational institutions.

## Features

### Accessibility and Convenience
- User-friendly platform for bike hire with easy navigation
- Online booking system
- Real-time bike availability monitoring
- Role-based access (Students, Teaching Staff, Non-Teaching Staff)

### Sustainable Mobility
- Carbon footprint tracking per ride
- Distance tracking for environmental impact
- Environmental impact analytics dashboard

### Smart Fleet Management
- Automated rental transactions
- Maintenance tracking and notifications
- GPS-based real-time tracking
- Zone violation monitoring
- Service requirement notifications

### Data Analytics
- Environmental impact metrics
- CO₂ reduction tracking
- Bike utilization analytics
- User behavior insights

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Next.js API Routes
- **Database**: Neon PostgreSQL
- **Authentication**: NextAuth.js
- **Deployment**: Vercel
- **Maps & Location**: Mapbox/Google Maps API
- **Real-time Updates**: WebSocket/Socket.io
- **Analytics**: Custom analytics dashboard

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="your-neon-connection-string"

# Authentication
NEXTAUTH_SECRET="generate-a-random-secret"
NEXTAUTH_URL="http://localhost:3000"

# Maps API
NEXT_PUBLIC_MAPS_API_KEY="your-maps-api-key"

# Other Services
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

## Project Structure

```
src/
├── app/                    # Next.js 14 app directory
│   ├── api/               # API routes
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Dashboard routes
│   └── (public)/          # Public routes
├── components/            # Reusable components
│   ├── ui/               # UI components
│   ├── forms/            # Form components
│   └── features/         # Feature-specific components
├── lib/                  # Utility functions and shared logic
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
├── styles/               # Global styles
└── prisma/               # Database schema and migrations
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

MIT 