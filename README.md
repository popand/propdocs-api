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
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js or Fastify
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with Passport.js
- **File Storage**: AWS S3 or Google Cloud Storage

### API Architecture
- **Design Pattern**: RESTful API with OpenAPI/Swagger documentation
- **Data Validation**: Joi or Zod schemas
- **Error Handling**: Centralized error middleware
- **Logging**: Winston or Pino structured logging
- **Testing**: Jest with Supertest for integration testing

### Infrastructure
- **Deployment**: Docker containers on AWS/GCP
- **Monitoring**: Application performance monitoring and health checks
- **Caching**: Redis for session management and data caching
- **Queue Processing**: Bull/BullMQ for background jobs
- **Security**: Rate limiting, CORS, input sanitization

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
- MongoDB 5.0+
- Redis (optional, for caching)
- AWS/GCP account (for file storage)

### Installation
```bash
# Clone the repository
git clone https://github.com/your-org/propdocs-api.git
cd propdocs-api

# Install dependencies  
npm install

# Set up environment variables
cp .env.example .env

# Start development server
npm run dev
```

### Environment Variables
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=mongodb://localhost:27017/propdocs
JWT_SECRET=your-jwt-secret
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=your-s3-bucket
```

## 🏗️ Architecture Overview

```
API Gateway (Express/Fastify)
├── Authentication Middleware
├── Route Handlers
│   ├── Auth Routes
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
│   ├── MongoDB Models
│   ├── Repository Pattern
│   └── Query Optimization
└── External Integrations
    ├── File Storage (S3/GCS)
    ├── AI/ML Services
    └── Notification Services
```

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Multi-factor authentication support
- OAuth integration (Google, Apple)

### Data Protection
- Input validation and sanitization
- SQL injection prevention
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
- **Unit Tests**: Service layer and utility functions
- **Integration Tests**: API endpoints and database operations  
- **Load Tests**: Performance under high traffic
- **Security Tests**: Vulnerability scanning and penetration testing

## 📊 Monitoring & Observability

### Application Monitoring
- Health check endpoints (`/health`, `/ready`)
- Structured logging with correlation IDs
- Performance metrics and alerting
- Error tracking and reporting

### Infrastructure Monitoring  
- Resource utilization (CPU, memory, disk)
- Database performance and query optimization
- API response times and error rates
- File storage usage and costs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*PropDocs API - Powering the future of property asset management* 🏠