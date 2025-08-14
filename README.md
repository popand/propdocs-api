# PropDocs API - Property Asset Management Backend

> Backend API powering the PropDocs property asset management platform

This repository contains the backend API for PropDocs, a property asset management system that helps homeowners track, maintain, and manage household assets. The API provides core functionality for asset management, AI-powered maintenance scheduling, user authentication, and property showcase features.

## 🚀 API Capabilities

### Core Services
- **User Authentication**: JWT-based auth with multi-provider support (Apple, Google)
- **Property Management**: Multi-property support with address validation
- **Asset CRUD Operations**: Complete asset lifecycle management
- **Photo Upload & Processing**: Image storage with compression and thumbnail generation
- **AI Integration**: Computer vision for asset identification and maintenance recommendations

### Data Management
- **RESTful API Design**: Clean, consistent endpoints following REST principles  
- **Database Operations**: Optimized queries with proper indexing and caching
- **File Storage**: Secure cloud storage for asset photos and documents
- **Sync Management**: Offline-first support with conflict resolution

### Advanced Features
- **Maintenance Scheduling**: AI-powered maintenance recommendations and scheduling
- **Notification System**: Configurable alerts and reminders
- **Report Generation**: Professional PDF reports and property showcases
- **Analytics Engine**: Property health scores and maintenance insights
- **Third-party Integrations**: Service provider APIs and real estate tools

## 🏗️ Technical Stack

### Backend Framework
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Fastify
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **File Storage**: AWS S3

### API Architecture
- **Design Pattern**: RESTful API with Swagger documentation
- **Data Validation**: Zod schemas
- **Error Handling**: Centralized error middleware
- **Logging**: Winston structured logging
- **Testing**: Jest with integration testing

### Infrastructure
- **Deployment**: Docker containers
- **Monitoring**: Application performance monitoring and health checks
- **Caching**: Redis for sessions and caching
- **Security**: Rate limiting, CORS, input validation
- **AI Integration**: OpenAI Vision API / Google Vision

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `POST /api/auth/refresh` - Token refresh
- `DELETE /api/auth/logout` - User logout

### Properties
- `GET /api/properties` - List user properties
- `POST /api/properties` - Create new property
- `GET /api/properties/:id` - Get property details
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Assets
- `GET /api/properties/:propertyId/assets` - List property assets
- `POST /api/properties/:propertyId/assets` - Create asset
- `GET /api/assets/:id` - Get asset details
- `PUT /api/assets/:id` - Update asset
- `DELETE /api/assets/:id` - Delete asset

### Maintenance
- `GET /api/assets/:assetId/maintenance` - Get maintenance schedules
- `POST /api/assets/:assetId/maintenance` - Create maintenance task
- `PUT /api/maintenance/:id/complete` - Mark task complete

### File Upload
- `POST /api/upload/photos` - Upload asset photos
- `GET /api/files/:id` - Retrieve file
- `DELETE /api/files/:id` - Delete file

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+
- Redis 6.0+
- AWS account (for S3 file storage)

### Installation
```bash
# Clone the repository
git clone https://github.com/your-org/propdocs-api.git
cd propdocs-api

# Install dependencies  
npm install

# Set up environment variables
cp .env.example .env

# Setup database
npx prisma migrate dev
npx prisma db seed

# Start development server
npm run dev
```

### Environment Variables
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://username:password@localhost:5432/propdocs
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
REDIS_URL=redis://localhost:6379
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=your-s3-bucket
AWS_REGION=us-east-1
```

## 🏗️ Architecture Overview

```
Fastify API Server
├── Authentication Middleware (JWT)
├── Route Handlers
│   ├── Auth Routes (Apple/Google Sign In)
│   ├── Property Routes  
│   ├── Asset Routes
│   ├── Maintenance Routes
│   └── File Upload Routes
├── Business Logic Services
│   ├── User Service
│   ├── Property Service
│   ├── Asset Service
│   ├── Maintenance Service
│   └── AI Integration Service
├── Data Access Layer
│   ├── Prisma ORM
│   ├── PostgreSQL Database
│   ├── Repository Pattern
│   └── Query Optimization
└── External Integrations
    ├── AWS S3 (File Storage)
    ├── Redis (Caching/Sessions)
    ├── OpenAI/Google Vision (AI)
    └── Email/Push Notifications
```

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Multi-factor authentication support
- OAuth integration (Google, Apple)

### Data Protection
- Input validation with Zod schemas
- SQL injection prevention via Prisma ORM
- Rate limiting and DDoS protection
- Encrypted data at rest and in transit
- GDPR and CCPA compliance

### API Security
- HTTPS/TLS encryption
- CORS configuration
- Request/response logging
- API key management
- Webhook signature verification

## 🧪 Testing

### Test Coverage
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration

# Run load tests
npm run test:load
```

### Test Structure
- **Unit Tests**: Service layer and utility functions with Jest
- **Integration Tests**: API endpoints with Prisma test database
- **Load Tests**: Performance testing under high traffic
- **Security Tests**: Vulnerability scanning and penetration testing

## 📊 Monitoring & Observability

### Application Monitoring
- Health check endpoints (`/health`, `/ready`)
- Structured logging with correlation IDs
- Performance metrics and alerting
- Error tracking and reporting

### Infrastructure Monitoring  
- Resource utilization (CPU, memory, disk)
- PostgreSQL performance and query optimization
- Fastify API response times and error rates
- AWS S3 storage usage and costs
- Redis cache hit rates and memory usage


---
