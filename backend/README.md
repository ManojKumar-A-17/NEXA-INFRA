# NEXA INFRA Backend API

Backend REST API for NEXA INFRA Construction Management Platform built with Node.js, Express, TypeScript, and MongoDB.

## Tech Stack

- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database (Atlas)
- **Mongoose** - ODM
- **JWT** - Authentication
- **Socket.io** - Real-time chat
- **Stripe** - Payment processing
- **Cloudinary** - File uploads
- **Nodemailer** - Email notifications

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files (database, etc.)
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Custom middleware (auth, error, validation)
│   ├── models/         # Mongoose schemas/models
│   ├── routes/         # API route definitions
│   ├── services/       # Business logic & external services
│   ├── utils/          # Utility functions
│   └── server.ts       # Application entry point
├── .env.example        # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:
- `MONGODB_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `ADMIN_EMAIL` - Admin user email (aamanojkumar190@gmail.com)

### 3. Start Development Server

```bash
npm run dev
```

Server will start on `http://localhost:5000`

### 4. Build for Production

```bash
npm run build
npm start
```

## API Endpoints

### Authentication (`/api/auth`)

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - Logout user (protected)

### Health Check

- `GET /health` - API health check

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Admin Access

Only the email `aamanojkumar190@gmail.com` can register as admin role.

## Database Models

- **User** - User accounts (user, contractor, admin)
- **Contractor** - Contractor profiles with specialties, ratings, portfolio
- **Project** - Construction projects with status tracking
- More models coming soon (Payment, Review, ChatMessage)

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Lint code with ESLint
- `npm run format` - Format code with Prettier

### Code Style

- TypeScript strict mode enabled
- ESLint for code quality
- Prettier for code formatting

## Security Features

- Helmet.js for HTTP headers security
- CORS configuration
- Rate limiting on API routes
- Password hashing with bcrypt
- JWT token authentication
- Input validation with express-validator

## Next Steps

1. ✅ Basic authentication setup
2. ⏳ Project management endpoints
3. ⏳ Contractor endpoints
4. ⏳ Payment integration (Stripe)
5. ⏳ File upload (Cloudinary)
6. ⏳ Real-time chat (Socket.io)
7. ⏳ Email notifications
8. ⏳ Admin dashboard APIs

## License

ISC
