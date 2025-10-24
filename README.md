# FastAPI + React CRUD Application

A modern full-stack CRUD application built with FastAPI (Python) backend and React (TypeScript) frontend, featuring JWT authentication and modern UI design with SCSS and Tailwind CSS.

## Features

### Backend (FastAPI)
- ✅ JWT Authentication (login, signup, forgot/reset password)
- ✅ Full CRUD operations for items
- ✅ Advanced filtering, pagination, and search
- ✅ Statistics endpoint for dashboard
- ✅ PostgreSQL database with SQLAlchemy ORM
- ✅ Automatic API documentation (Swagger/OpenAPI)
- ✅ Docker containerized

### Frontend (React + TypeScript)
- ✅ Modern responsive UI with Tailwind CSS + SCSS
- ✅ Type-safe with TypeScript interfaces
- ✅ React Router for navigation
- ✅ Authentication context for state management
- ✅ Glassmorphism design with animations
- ✅ Native Fetch API for HTTP requests
- ✅ Docker containerized

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Run with Docker (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd fastapi-reactjs-crud
```

2. Start all services:
```bash
docker-compose up --build
```

3. Access the application:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Database**: localhost:5432

## Development Status

### ✅ Completed Core Infrastructure
- [x] Project structure setup
- [x] Docker configuration (PostgreSQL, FastAPI, React)
- [x] Backend API implementation with all endpoints
- [x] Database models and schemas
- [x] JWT authentication system
- [x] Frontend basic structure with routing
- [x] TypeScript interfaces
- [x] SCSS styling system with variables and mixins
- [x] API integration utilities
- [x] Authentication context

### 🚧 Ready for Development
The application foundation is complete! You can now:

1. **Start the services**: `docker-compose up --build`
2. **Develop frontend pages**: Complete the authentication and CRUD pages
3. **Test the API**: Visit http://localhost:8000/docs for interactive API docs
4. **Customize the UI**: Modify SCSS variables and components for your design

---

**Built with ❤️ using FastAPI and React**
