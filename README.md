# XL Soccer App

A modern, full-stack web application for managing soccer sessions, player registrations, and payments. Built with React, TypeScript, GraphQL, and Stripe integration.

## 🚀 Features

- **Session Management**: Browse and register for soccer sessions with age-specific filtering
- **Family Management**: Add and manage family members for easy registration
- **Payment Processing**: Secure payment handling with Stripe integration
- **Billing Dashboard**: View transaction history and manage payment methods
- **User Authentication**: JWT-based authentication with role-based access
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Updates**: GraphQL subscriptions for live data updates

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Apollo Client** for GraphQL state management
- **Tailwind CSS** for styling
- **Vite** for build tooling
- **Stripe Elements** for payment processing

### Backend
- **Node.js** with TypeScript
- **Apollo Server** for GraphQL API
- **MongoDB** with Mongoose ODM
- **Stripe** for payment processing
- **JWT** for authentication
- **Express** for middleware

### Development Tools
- **ESLint** for code linting
- **TypeScript** for type safety
- **Git** for version control

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or Atlas)
- Stripe account

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/basquith16/xlsoccerapp.git
cd xlsoccerapp
```

### 2. Install Dependencies

```bash
# Install backend dependencies
cd api
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 3. Environment Setup

#### Backend Environment Variables

Create a `.env` file in the `api` directory:

```env
# Database
DATABASE=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
DATABASE_PASSWORD=your_mongodb_password

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=90d

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Server
NODE_ENV=development
PORT=4000
```

#### Frontend Environment Variables

Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:4000/graphql
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### 4. Start Development Servers

```bash
# Start backend server (from api directory)
cd api
npm run dev

# Start frontend server (from client directory, in a new terminal)
cd client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000/graphql

## 📁 Project Structure

```
xlsoccerapp/
├── api/                    # Backend API
│   ├── src/
│   │   ├── graphql/       # GraphQL schema and resolvers
│   │   ├── models/        # MongoDB models
│   │   ├── services/      # Business logic services
│   │   ├── utils/         # Utility functions
│   │   └── server.ts      # Server entry point
│   ├── dev-data/          # Development data scripts
│   └── package.json
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utility functions
│   └── package.json
└── README.md
```

## 🔧 Available Scripts

### Backend (api directory)

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Frontend (client directory)

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🗄 Database Schema

### Core Models

- **User**: Authentication and profile information
- **Player**: Family member profiles with age validation
- **Session**: Soccer session details with capacity management
- **Booking**: Session registrations with payment status
- **Review**: User reviews for sessions

## 🔐 Authentication

The app uses JWT-based authentication with the following features:

- Secure token generation and validation
- Role-based access control
- Automatic token refresh
- Protected routes and API endpoints

## 💳 Payment Integration

Stripe integration provides:

- Secure payment processing
- Multiple payment method support
- Transaction history
- Automatic payment method management
- Webhook handling for payment events

## 🧪 Testing

```bash
# Run backend tests
cd api
npm test

# Run frontend tests
cd client
npm test
```

## 🚀 Deployment

### Backend Deployment

1. Set up environment variables in production
2. Build the application: `npm run build`
3. Deploy to your preferred platform (Heroku, Vercel, etc.)

### Frontend Deployment

1. Update API URL in environment variables
2. Build the application: `npm run build`
3. Deploy the `dist` folder to your hosting platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 Code Style

- Use TypeScript for type safety
- Follow ESLint configuration
- Use meaningful variable and function names
- Add comments for complex logic
- Keep components small and focused

## 🔒 Security

- JWT tokens for authentication
- Input validation and sanitization
- Rate limiting on API endpoints
- Secure payment processing with Stripe
- Environment variable protection

## 📞 Support

For support and questions:

- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation in the `/docs` folder

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Stripe](https://stripe.com/) for payment processing
- [Apollo GraphQL](https://www.apollographql.com/) for GraphQL tools
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [MongoDB](https://www.mongodb.com/) for database

---

**Built with ❤️ for the soccer community** 