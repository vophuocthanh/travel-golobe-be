<div align="center">
 <h1>Travel GoLobe Backend 🚀</h1>
</div>

<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" />
</p>

## 📝 Overview

Travel GoLobe is a comprehensive travel management system that provides a complete solution for tour booking, hotel reservations, and flight management. The system is built with modern technologies and follows best practices for scalability and maintainability.

## 🛠 Tech Stack

<div align="center">
  <img src="https://img.shields.io/badge/nestjs-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="nestjs" />
  <img src="https://img.shields.io/badge/-TypeScript-black?style=for-the-badge&logoColor=white&logo=typescript&color=3178C6" alt="typescript" />
  <img src="https://img.shields.io/badge/postgresql-4169e1?style=for-the-badge&logo=postgresql&logoColor=white" alt="postgresql" />
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="prisma" />
  <img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white" alt="jwt" />
  <img src="https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white" alt="aws" />
  <img src="https://img.shields.io/badge/MoMo-A50064?style=for-the-badge&logo=momo&logoColor=white" alt="momo" />
</div>

## ✨ Key Features

### 🏨 Hotel Management
- Hotel search and booking
- Hotel reviews and ratings
- Hotel crawling integration
- Room availability management

### ✈️ Flight Management
- Flight search and booking
- Flight crawling integration
- Flight schedule management
- Seat availability tracking

### 🗺 Tour Management
- Tour package creation and management
- Tour booking system
- Tour reviews and comments
- Tour itinerary management

### 👥 User Management
- User authentication and authorization
- Role-based access control
- User profile management
- Booking history

### 💳 Payment Integration
- MoMo payment gateway integration
- Secure payment processing
- Payment status tracking
- Transaction history

## 📁 Project Structure

```
src/
├── modules/                 # Feature modules
│   ├── auth/               # Authentication module
│   ├── bookings/           # Booking management
│   ├── flight-crawl/       # Flight data crawling
│   ├── hotel-crawl/        # Hotel data crawling
│   ├── hotel-comment/      # Hotel reviews
│   ├── momo/              # Payment integration
│   ├── role/              # Role management
│   ├── road-vehicle/      # Transportation management
│   ├── tour/              # Tour management
│   ├── tour-comment/      # Tour reviews
│   └── user/              # User management
├── common/                 # Common utilities
├── decorator/             # Custom decorators
├── enums/                 # Enum definitions
├── guard/                 # Authentication guards
├── helpers/               # Helper functions
├── lib/                   # Library configurations
├── types/                 # TypeScript types
└── utils/                 # Utility functions
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL
- AWS Account (for S3 storage)

### Installation

1. Clone the repository
```bash
git clone [repository-url]
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory with the following variables:
```env
DATABASE_URL=
ACCESS_TOKEN_KEY=
REFRESH_TOKEN_KEY=
MAIL_TRANSPORT=
MAIL_FROM=
JWT_SECRET=
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET_NAME=
MOMO_YOUR_SECRET_KEY=
MOMO_PARTNER_CODE=
MOMO_ACCESS_KEY=
MOMO_REDIRECT_URL=
MOMO_IPN_URL=
```

4. Run database migrations
```bash
npx prisma migrate dev
```

5. Start the development server
```bash
npm run start:dev
```

## 📚 API Documentation

Access the Swagger API documentation at:
```
http://localhost:3001/api
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🔐 Security Features

- JWT-based authentication
- Role-based access control
- Secure password hashing
- API rate limiting
- CORS protection
- Input validation
- XSS protection

## 📦 Deployment

The application can be deployed using:
```bash
npm run build
npm run start:prod
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

Made with ❤️ by [ThanhDev](https://www.facebook.com/thanh.vophuoc.50)
