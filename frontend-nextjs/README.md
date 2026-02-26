# LoadShed Predictor - Next.js Frontend

A complete Next.js replica of the LoadShed Predictor application, providing AI-powered load shedding predictions for South Africa.

## Features

### 🔐 Authentication System
- **Login & Registration** - Complete user authentication with JWT tokens
- **Session Management** - Automatic logout on session expiry
- **Protected Routes** - Auth guards for authenticated pages

### 🎯 Core Functionality
- **Prediction Engine** - AI-powered load shedding stage predictions
- **History Management** - View, manage, and analyze prediction history
- **Cost Calculator** - Calculate financial impact and compare generator vs pause options
- **Dashboard** - Overview of recent predictions and system status

### 🎨 UI Components
- **Responsive Design** - Mobile-first responsive layout
- **Modern UI** - Clean, accessible interface with Tailwind CSS
- **Interactive Forms** - TanStack Form with real-time validation
- **Loading States** - Smooth loading indicators and transitions

## Technology Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Forms**: TanStack React Form
- **Icons**: Lucide React
- **API Client**: Custom fetch wrapper with error handling

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your API URL:
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:3000
   ```

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── costs/             # Cost calculator
│   ├── dashboard/         # User dashboard
│   ├── history/           # Prediction history
│   ├── predict/           # Prediction form
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Homepage
├── components/            # Reusable components
│   ├── ui/               # UI component library
│   └── Header.tsx        # Navigation header
├── hooks/                # Custom React hooks
│   └── useAuth.tsx       # Authentication hook
└── lib/                  # Utilities and API client
    ├── api.ts            # API client
    └── utils.ts          # Utility functions
```

## Key Pages

### 🏠 Homepage (`/`)
- Hero section with feature highlights
- Call-to-action for new users
- Quick access to main features

### 🔮 Predict (`/predict`)
- Location and date/time selection
- Optional weather and demand parameters
- Real-time prediction results with confidence scores
- Direct integration with cost calculator

### 📊 Dashboard (`/dashboard`)
- User statistics and recent predictions
- Quick action buttons
- System health monitoring

### 📋 History (`/history`)
- Paginated prediction history table
- View, filter, and delete predictions
- Detailed prediction modals

### 💰 Cost Calculator (`/costs`)
- Business parameter input form
- Generator vs pause operations comparison
- Financial recommendations with savings calculations

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL | `http://localhost:8000/api/v1` |

## Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

## Features Comparison

This Next.js version maintains feature parity with the original TanStack Start implementation:

✅ **Complete Authentication System**  
✅ **AI Prediction Engine**  
✅ **Prediction History Management**  
✅ **Cost Calculator with Recommendations**  
✅ **Responsive Mobile Design**  
✅ **Error Handling & Session Management**  
✅ **Type Safety with TypeScript**

## Deployment

The application is ready for deployment on:

- **Vercel** (Recommended)
- **Netlify**
- **AWS Amplify**
- **Docker containers**
