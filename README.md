# SOFIVE Soccer Center Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue)](https://www.typescriptlang.org/)

A comprehensive, full-stack web application for managing soccer sessions, player registrations, family relationships, and payments. Built with modern technologies and designed for soccer centers to streamline operations and enhance user experience.

## 🌟 Overview

SOFIVE Soccer Center Management System is a production-ready application that enables soccer facilities to:
- Manage session templates, schedules, and instances
- Handle player registrations and family management
- Process secure payments via Stripe
- Provide role-based admin dashboards
- Track billing and transaction history

## 🚀 Features

### Core Functionality
- **🏟️ Session Management**: Complete session lifecycle with templates, periods, and instances
- **👨‍👩‍👧‍👦 Family & Player Management**: Comprehensive player profiles with family relationships
- **💳 Payment Processing**: Secure Stripe integration with multiple payment methods
- **📊 Admin Dashboard**: Full administrative controls with user, player, and session management
- **🔐 Authentication & Authorization**: JWT-based auth with role-based access (user, coach, admin)
- **📱 Responsive Design**: Mobile-first approach with Tailwind CSS

### Advanced Features
- **🔄 Real-time Updates**: GraphQL subscriptions for live data synchronization
- **📈 Analytics Dashboard**: Performance metrics and reporting (coming soon)
- **⚡ Performance Optimized**: DataLoader for N+1 query prevention, React.memo for optimization
- **🛡️ Security Hardened**: Rate limiting, input sanitization, secure cookie handling
- **🎯 Type Safety**: Full TypeScript implementation across frontend and backend

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3.1 | UI Framework |
| **TypeScript** | 5.8.3 | Type Safety |
| **Apollo Client** | 3.13.8 | GraphQL Client & State Management |
| **Tailwind CSS** | 3.4.3 | Styling Framework |
| **Vite** | 7.0.4 | Build Tool & Dev Server |
| **React Router** | 7.6.3 | Client-side Routing |
| **Stripe Elements** | 7.5.0 | Payment UI Components |
| **Lucide React** | 0.525.0 | Icon Library |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | ≥16.0.0 | Runtime Environment |
| **TypeScript** | 5.7.2 | Type Safety |
| **Apollo Server** | 5.0.0 | GraphQL Server |
| **Express.js** | 4.21.2 | Web Framework |
| **MongoDB** | 8.8.0 (Mongoose) | Database & ODM |
| **Stripe** | 18.3.0 | Payment Processing |
| **DataLoader** | 2.2.3 | Batch Loading & Caching |
| **JWT** | 9.0.2 | Authentication |

### Security & Performance
- **Helmet** - Security headers
- **Rate Limiting** - API protection
- **Bcrypt** - Password hashing
- **Compression** - Response compression
- **CORS** - Cross-origin resource sharing
- **Input Sanitization** - XSS protection

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (v7.0.0 or higher) or **yarn** (v1.22.0 or higher)
- **MongoDB** (local installation or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Stripe Account** - [Sign up](https://stripe.com/)
- **Git** - [Download](https://git-scm.com/)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/basquith16/xlsoccerapp.git
cd xlsoccerapp
```

### 2. Install Dependencies

```bash
# Install backend dependencies
cd API
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 3. Environment Configuration

#### Backend Environment Variables

Create `API/config.env` (use `API/config.env.example` as template):

```env
# Database Configuration
DATABASE=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
DATABASE_PASSWORD=your_mongodb_password

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_min_32_characters
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email Configuration (Mailgun)
MAILGUN_API=your_mailgun_api_key

# Server Configuration
NODE_ENV=development
PORT=4000

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=15
```

#### Frontend Environment Variables

Create `client/.env`:

```env
# API Configuration
VITE_API_URL=http://localhost:4000/graphql

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Environment
VITE_NODE_ENV=development
```

### 4. Database Setup

```bash
# If using local MongoDB, start the service
sudo service mongod start

# Run data migration (optional - for sample data)
cd API
npm run migrate
```

### 5. Start Development Servers

```bash
# Terminal 1: Start backend server
cd API
npm run dev

# Terminal 2: Start frontend server
cd client
npm run dev
```

### 6. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000/graphql
- **GraphQL Playground**: http://localhost:4000/graphql (in development)

## 📁 Project Structure

```
xlsoccerapp/
├── API/                           # Backend Application
│   ├── src/
│   │   ├── graphql/              # GraphQL Implementation
│   │   │   ├── resolvers/        # GraphQL Resolvers
│   │   │   ├── schemas/          # GraphQL Type Definitions
│   │   │   └── server.ts         # Apollo Server Setup
│   │   ├── models/               # MongoDB Models
│   │   │   ├── userModel.ts      # User Schema
│   │   │   ├── playerModel.ts    # Player Schema
│   │   │   ├── sessionModel.ts   # Session Schema
│   │   │   └── bookingModel.ts   # Booking Schema
│   │   ├── services/             # Business Logic Services
│   │   ├── utils/                # Utilities & Middleware
│   │   │   ├── authMiddleware.ts # Authentication
│   │   │   ├── dataLoaders.ts    # DataLoader Setup
│   │   │   ├── errorHandler.ts   # Error Handling
│   │   │   ├── logger.ts         # Logging System
│   │   │   └── validation.ts     # Input Validation
│   │   ├── types/                # TypeScript Type Definitions
│   │   └── server.ts             # Application Entry Point
│   ├── dev-data/                 # Development Data & Scripts
│   ├── config.env.example        # Environment Template
│   └── package.json
├── client/                        # Frontend Application
│   ├── src/
│   │   ├── components/           # React Components
│   │   │   ├── admin/           # Admin Dashboard Components
│   │   │   │   ├── users/       # User Management
│   │   │   │   ├── players/     # Player Management
│   │   │   │   └── sessions/    # Session Management
│   │   │   ├── auth/            # Authentication Components
│   │   │   ├── billing/         # Payment Components
│   │   │   ├── common/          # Reusable Components
│   │   │   ├── layout/          # Layout Components
│   │   │   └── ui/              # UI Components
│   │   ├── pages/               # Page Components
│   │   ├── hooks/               # Custom React Hooks
│   │   ├── services/            # API Services
│   │   │   └── graphql/         # GraphQL Queries & Mutations
│   │   ├── types/               # TypeScript Definitions
│   │   ├── utils/               # Utility Functions
│   │   └── App.tsx              # Application Root
│   ├── public/                  # Static Assets
│   └── package.json
├── docs/                        # Documentation (if applicable)
├── .gitignore                   # Git Ignore Rules
├── LICENSE                      # License File
└── README.md                    # This File
```

## 🔧 Available Scripts

### Backend (API directory)

```bash
npm run dev          # Start development server with hot reload
npm run build        # Compile TypeScript to JavaScript
npm run start        # Start production server
npm run start:prod   # Start production server with NODE_ENV=production
npm run debug        # Start server with debugging enabled
npm run migrate      # Run database migrations
npm run recover      # Recover database from backup
npm run codegen      # Generate GraphQL types
```

### Frontend (client directory)

```bash
npm run dev          # Start Vite development server
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run lint         # Run ESLint code analysis
```

## 🗄️ Database Schema

### Core Models

#### User Model
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'coach' | 'admin';
  password: string;
  birthday: Date;
  active: boolean;
  waiverSigned: boolean;
  joinedDate: Date;
  familyMembers: Player[];
}
```

#### Player Model
```typescript
interface Player {
  id: string;
  name: string;
  birthDate: Date;
  sex: 'male' | 'female' | 'other';
  isMinor: boolean;
  waiverSigned: boolean;
  profImg: string;
  parent: User;
}
```

#### Session Model
```typescript
interface Session {
  id: string;
  name: string;
  sport: string;
  description: string;
  rosterLimit: number;
  availableSpots: number;
  price: number;
  startDates: Date[];
  endDate: Date;
  timeStart: string;
  timeEnd: string;
  trainers: User[];
  isActive: boolean;
  slug: string;
}
```

## 🔐 Authentication & Authorization

### Authentication Flow
1. **Registration/Login**: JWT tokens issued upon successful authentication
2. **Token Storage**: Secure httpOnly cookies for token storage
3. **Token Refresh**: Automatic token refresh mechanism
4. **Role-based Access**: Different permissions for user, coach, and admin roles

### Protected Routes
- `/admin/*` - Admin only
- `/profile` - Authenticated users only
- `/billing` - Authenticated users only

### API Authorization
- **Public**: Session browsing, user registration
- **Authenticated**: Profile management, bookings, billing
- **Admin**: User management, session management, analytics

## 💳 Payment Integration

### Stripe Features
- **Secure Payments**: PCI DSS compliant payment processing
- **Multiple Payment Methods**: Credit cards, ACH, Apple Pay, Google Pay
- **Subscription Management**: Recurring payment handling
- **Webhook Integration**: Real-time payment status updates
- **Payment History**: Complete transaction tracking

### Payment Flow
1. User selects session and provides payment method
2. Frontend creates payment intent via GraphQL
3. Stripe Elements handles secure payment collection
4. Webhook confirms payment status
5. Booking is created and confirmed

## 🧪 Testing

```bash
# Run backend tests
cd API
npm test

# Run frontend tests  
cd client
npm test

# Run integration tests
npm run test:integration

# Generate test coverage report
npm run test:coverage
```

## 🚀 Deployment

### Environment Setup
1. **Production Database**: Set up MongoDB Atlas or production MongoDB instance
2. **Environment Variables**: Configure production environment variables
3. **SSL Certificates**: Ensure HTTPS is enabled
4. **Domain Configuration**: Set up custom domain with DNS

### Backend Deployment (Node.js)

#### Option 1: Vercel
```bash
cd API
npm run build
# Deploy using Vercel CLI or GitHub integration
```

#### Option 2: Railway/Heroku
```bash
# Set environment variables in platform dashboard
git push origin main  # Triggers automatic deployment
```

#### Option 3: VPS/Docker
```bash
# Build production image
docker build -t soccer-app-api .
docker run -p 4000:4000 --env-file .env soccer-app-api
```

### Frontend Deployment

#### Option 1: Vercel
```bash
cd client
npm run build
# Deploy dist folder via Vercel
```

#### Option 2: Netlify
```bash
cd client
npm run build
# Deploy dist folder via Netlify
```

## 🛡️ Security Best Practices

### Implementation
- **Input Validation**: All inputs sanitized and validated
- **Rate Limiting**: API endpoints protected against abuse
- **CORS Configuration**: Properly configured for production domains
- **Helmet Integration**: Security headers automatically applied
- **JWT Security**: Secure token generation and validation
- **Password Security**: Bcrypt hashing with salt rounds
- **Environment Variables**: Sensitive data never committed to version control

### Security Checklist
- [ ] SSL/TLS enabled in production
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] API rate limiting configured
- [ ] Input validation implemented
- [ ] Authentication tokens secure
- [ ] CORS properly configured
- [ ] Security headers enabled

## 📚 API Documentation

### GraphQL Endpoint
- **Development**: http://localhost:4000/graphql
- **Production**: https://your-domain.com/graphql

### Key Queries
```graphql
# Get all sessions
query GetSessions($limit: Int, $offset: Int) {
  sessions(limit: $limit, offset: $offset) {
    nodes {
      id
      name
      sport
      price
      availableSpots
    }
    totalCount
    hasNextPage
  }
}

# Get user profile
query GetProfile {
  me {
    id
    name
    email
    role
    familyMembers {
      id
      name
      birthDate
    }
  }
}
```

### Key Mutations
```graphql
# Create booking
mutation CreateBooking($input: CreateBookingInput!) {
  createBooking(input: $input) {
    id
    session {
      name
    }
    status
  }
}

# Update user profile
mutation UpdateProfile($input: UpdateUserInput!) {
  updateMe(input: $input) {
    id
    name
    email
  }
}
```

## 🔍 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check MongoDB connection
mongo --eval "db.adminCommand('ismaster')"

# Verify environment variables
echo $DATABASE
```

#### Build Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear TypeScript cache
rm -rf dist/
npm run build
```

#### Payment Issues
```bash
# Verify Stripe keys
stripe listen --forward-to localhost:4000/webhook
```

### Performance Optimization
- Enable gzip compression
- Implement Redis caching for sessions
- Use CDN for static assets
- Optimize database queries with indexes
- Enable MongoDB connection pooling

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### Getting Started
1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/yourusername/xlsoccerapp.git`
3. **Create** a feature branch: `git checkout -b feature/amazing-feature`
4. **Install** dependencies: `npm install`
5. **Make** your changes
6. **Test** your changes: `npm test`
7. **Commit** your changes: `git commit -m 'Add amazing feature'`
8. **Push** to the branch: `git push origin feature/amazing-feature`
9. **Submit** a Pull Request

### Code Standards
- **TypeScript**: All new code must be written in TypeScript
- **ESLint**: Follow the existing ESLint configuration
- **Testing**: Add tests for new functionality
- **Documentation**: Update documentation for API changes
- **Commit Messages**: Use conventional commit format

### Pull Request Guidelines
- Provide clear description of changes
- Include screenshots for UI changes
- Ensure all tests pass
- Update documentation as needed
- Follow existing code patterns

## 📞 Support & Community

### Getting Help
- **GitHub Issues**: [Create an issue](https://github.com/basquith16/xlsoccerapp/issues)
- **Documentation**: Check the `/docs` folder for detailed guides
- **Stack Overflow**: Tag questions with `xlsoccerapp`

### Community Guidelines
- Be respectful and inclusive
- Help others learn and grow
- Share knowledge and best practices
- Report bugs and suggest improvements

## 🔄 Changelog

### Version 2.0.0 (Current)
- ✅ Complete admin dashboard with user, player, and session management
- ✅ Enhanced GraphQL API with DataLoader optimization
- ✅ Secure authentication with httpOnly cookies
- ✅ Comprehensive player and family management
- ✅ Improved TypeScript coverage and error handling
- ✅ Performance optimizations and security hardening

### Previous Versions
See [CHANGELOG.md](CHANGELOG.md) for detailed version history.

## 🗺️ Roadmap

### Upcoming Features
- [ ] **Mobile App**: React Native companion app
- [ ] **Advanced Analytics**: Detailed reporting and insights
- [ ] **Multi-location Support**: Support for multiple soccer centers
- [ ] **Calendar Integration**: Google Calendar and Outlook sync
- [ ] **SMS Notifications**: Twilio integration for notifications
- [ ] **Advanced Booking**: Recurring bookings and waitlists

### Performance Improvements
- [ ] **Caching Layer**: Redis implementation
- [ ] **CDN Integration**: Static asset optimization
- [ ] **Database Optimization**: Query performance improvements
- [ ] **Monitoring**: Application performance monitoring

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### MIT License Summary
- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use
- ❌ Liability
- ❌ Warranty

## 🙏 Acknowledgments

### Core Technologies
- [**React**](https://reactjs.org/) - The foundation of our frontend
- [**Apollo GraphQL**](https://www.apollographql.com/) - Powering our API layer  
- [**Stripe**](https://stripe.com/) - Secure payment processing
- [**MongoDB**](https://www.mongodb.com/) - Database and data storage
- [**Tailwind CSS**](https://tailwindcss.com/) - Styling and design system
- [**TypeScript**](https://www.typescriptlang.org/) - Type safety and developer experience

### Special Thanks
- Soccer community for feedback and requirements
- Open source contributors
- Beta testers and early adopters

---

<div align="center">

**Built with ❤️ for the soccer community**

[🏠 Homepage](https://your-domain.com) • [📖 Documentation](https://docs.your-domain.com) • [🐛 Report Bug](https://github.com/basquith16/xlsoccerapp/issues) • [✨ Request Feature](https://github.com/basquith16/xlsoccerapp/issues)

</div>