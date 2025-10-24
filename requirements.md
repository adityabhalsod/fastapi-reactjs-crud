# Complete CRUD Application Requirements

## Project Overview
Full-stack CRUD application with authentication system running entirely in Docker containers.

---

## Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL 15
- **Authentication**: JWT (JSON Web Tokens)
- **ORM**: SQLAlchemy
- **Password Hashing**: Passlib with Bcrypt

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS + SCSS (for custom styling and mixins)
- **HTTP Client**: Fetch API (no external libraries like Axios)
- **State Management**: React Hooks (useState, useEffect, useContext)
- **CSS Preprocessor**: SCSS for advanced styling features and mixins

### Infrastructure
- **Container Orchestration**: Docker Compose
- **Services**: 3 containers (PostgreSQL, FastAPI, React)

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React App     │────▶│   FastAPI       │────▶│   PostgreSQL    │
│   (Port 3000)   │◀────│   (Port 8000)   │◀────│   (Port 5432)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## Backend Requirements

### 1. Authentication Endpoints

#### POST `/api/auth/signup`
- **Purpose**: Register new user
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "username": "johndoe",
    "password": "SecurePass123!",
    "full_name": "John Doe"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "full_name": "John Doe",
    "created_at": "2025-10-24T10:30:00Z"
  }
  ```
- **Validations**:
  - Email format validation
  - Username: 3-50 characters, alphanumeric + underscore
  - Password: minimum 8 characters
  - Unique email and username
- **Errors**:
  - 400: Invalid data format
  - 409: Email/username already exists

#### POST `/api/auth/login`
- **Purpose**: Authenticate user and return JWT token
- **Request Body**:
  ```json
  {
    "username": "johndoe",
    "password": "SecurePass123!"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "johndoe",
      "full_name": "John Doe"
    }
  }
  ```
- **JWT Payload**:
  ```json
  {
    "sub": "1",
    "username": "johndoe",
    "exp": 1730000000
  }
  ```
- **Errors**:
  - 401: Invalid credentials

#### POST `/api/auth/forgot-password`
- **Purpose**: Initiate password reset (generate reset token)
- **Request Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "message": "Password reset token generated",
    "reset_token": "abc123def456",
    "expires_in": 3600
  }
  ```
- **Notes**:
  - In production, send email instead of returning token
  - Token expires in 1 hour
  - Store reset token hash in database

#### POST `/api/auth/reset-password`
- **Purpose**: Reset password using token
- **Request Body**:
  ```json
  {
    "reset_token": "abc123def456",
    "new_password": "NewSecurePass123!"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "message": "Password successfully reset"
  }
  ```
- **Errors**:
  - 400: Invalid or expired token

#### GET `/api/auth/me`
- **Purpose**: Get current user profile
- **Headers**: `Authorization: Bearer <token>`
- **Response** (200 OK):
  ```json
  {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "full_name": "John Doe",
    "created_at": "2025-10-24T10:30:00Z"
  }
  ```

### 2. CRUD Endpoints (Items/Resources)

All CRUD endpoints require authentication (JWT token in header).

#### GET `/api/items`
- **Purpose**: List all items (with pagination & filtering)
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `skip`: int (default: 0)
  - `limit`: int (default: 10, max: 100)
  - `search`: string (search in name/description)
  - `category`: string (filter by category)
  - `sort_by`: string (name, created_at, updated_at)
  - `order`: string (asc, desc)
- **Response** (200 OK):
  ```json
  {
    "items": [
      {
        "id": 1,
        "name": "Item One",
        "description": "Description of item one",
        "category": "Electronics",
        "price": 299.99,
        "quantity": 50,
        "is_active": true,
        "created_at": "2025-10-24T10:30:00Z",
        "updated_at": "2025-10-24T10:30:00Z",
        "owner_id": 1
      }
    ],
    "total": 1,
    "skip": 0,
    "limit": 10
  }
  ```

#### GET `/api/items/{id}`
- **Purpose**: Get single item by ID
- **Headers**: `Authorization: Bearer <token>`
- **Response** (200 OK):
  ```json
  {
    "id": 1,
    "name": "Item One",
    "description": "Description of item one",
    "category": "Electronics",
    "price": 299.99,
    "quantity": 50,
    "is_active": true,
    "created_at": "2025-10-24T10:30:00Z",
    "updated_at": "2025-10-24T10:30:00Z",
    "owner_id": 1,
    "owner": {
      "id": 1,
      "username": "johndoe",
      "full_name": "John Doe"
    }
  }
  ```
- **Errors**:
  - 404: Item not found

#### POST `/api/items`
- **Purpose**: Create new item
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "name": "New Item",
    "description": "Item description",
    "category": "Electronics",
    "price": 399.99,
    "quantity": 100,
    "is_active": true
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "id": 2,
    "name": "New Item",
    "description": "Item description",
    "category": "Electronics",
    "price": 399.99,
    "quantity": 100,
    "is_active": true,
    "created_at": "2025-10-24T11:00:00Z",
    "updated_at": "2025-10-24T11:00:00Z",
    "owner_id": 1
  }
  ```
- **Validations**:
  - name: required, 1-200 characters
  - description: optional, max 1000 characters
  - category: optional, max 100 characters
  - price: optional, >= 0
  - quantity: optional, >= 0

#### PUT `/api/items/{id}`
- **Purpose**: Update entire item (replace)
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: Same as POST
- **Response** (200 OK): Updated item object
- **Errors**:
  - 404: Item not found
  - 403: Not authorized (can only update own items)

#### PATCH `/api/items/{id}`
- **Purpose**: Partial update item
- **Headers**: `Authorization: Bearer <token>`
- **Request Body** (all fields optional):
  ```json
  {
    "name": "Updated Name",
    "price": 349.99
  }
  ```
- **Response** (200 OK): Updated item object

#### DELETE `/api/items/{id}`
- **Purpose**: Delete item
- **Headers**: `Authorization: Bearer <token>`
- **Response** (204 No Content)
- **Errors**:
  - 404: Item not found
  - 403: Not authorized (can only delete own items)

#### GET `/api/items/stats`
- **Purpose**: Get statistics (advanced feature)
- **Headers**: `Authorization: Bearer <token>`
- **Response** (200 OK):
  ```json
  {
    "total_items": 50,
    "total_value": 15000.50,
    "categories": [
      {"name": "Electronics", "count": 20},
      {"name": "Books", "count": 30}
    ],
    "recent_items": 5
  }
  ```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(200),
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
```

### Items Table
```sql
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    price DECIMAL(10, 2) DEFAULT 0,
    quantity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    owner_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_items_owner ON items(owner_id);
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_name ON items(name);
```

---

## Frontend Requirements

### Pages & Routes

#### 1. Authentication Pages

**Signup Page** (`/signup`)
- Modern design with gradient background
- Form fields:
  - Email (with validation icon)
  - Username
  - Full Name
  - Password (with strength indicator)
  - Confirm Password
- Real-time validation feedback
- "Already have account? Login" link
- Success: redirect to dashboard

**Login Page** (`/login`)
- Email/Username field
- Password field (with show/hide toggle)
- "Remember me" checkbox
- "Forgot password?" link
- "Don't have account? Sign up" link
- Success: redirect to dashboard

**Forgot Password Page** (`/forgot-password`)
- Email input field
- Submit button
- Success: show reset token (in production, show "check email")
- Back to login link

**Reset Password Page** (`/reset-password`)
- Token input (pre-filled from URL parameter if available)
- New password field
- Confirm password field
- Password strength indicator
- Success: redirect to login

#### 2. Dashboard/Items Pages

**Dashboard** (`/dashboard`)
- Protected route (requires authentication)
- Header with:
  - Logo
  - Search bar (live search)
  - User menu dropdown (Profile, Logout)
- Statistics cards:
  - Total Items
  - Total Value
  - Categories Count
  - Recent Items
- Quick actions: "Add Item" button

**Items List** (`/items`)
- Data table with columns:
  - Name
  - Category
  - Price
  - Quantity
  - Status (Active/Inactive badge)
  - Actions (View, Edit, Delete)
- Features:
  - Search/filter bar
  - Category filter dropdown
  - Sort options
  - Pagination controls
  - "Add New Item" button (floating action button)
- Empty state with illustration when no items

**Item Create/Edit Form** (`/items/new`, `/items/{id}/edit`)
- Modal or separate page with form:
  - Name (required)
  - Description (textarea)
  - Category (dropdown or input)
  - Price (number input with currency)
  - Quantity (number input)
  - Active toggle switch
- Cancel and Save buttons
- Loading state on submit
- Success notification

**Item Detail View** (`/items/{id}`)
- Display all item information
- Owner information
- Edit and Delete buttons (if owner)
- Timestamps
- Back button

### Modern Design Features

1. **Color Scheme**:
   - Primary: Indigo/Blue (#4F46E5)
   - Secondary: Purple (#7C3AED)
   - Success: Green (#10B981)
   - Danger: Red (#EF4444)
   - Dark mode support

2. **UI Components**:
   - Glassmorphism cards
   - Smooth transitions and animations
   - Hover effects on interactive elements
   - Loading skeletons
   - Toast notifications (success, error, info)
   - Confirmation modals for delete actions

3. **Animations & SCSS Features**:
   - Fade in on page load
   - Slide transitions between pages
   - Button ripple effects
   - Skeleton loaders for data fetching
   - Smooth scroll
   - SCSS mixins for reusable styles
   - Variables for consistent theming
   - Nested selectors for component styling

4. **Responsive Design**:
   - Mobile-first approach
   - Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
   - Hamburger menu for mobile
   - Touch-friendly button sizes

### TypeScript Interfaces

```typescript
interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  created_at: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

interface Item {
  id: number;
  name: string;
  description?: string;
  category?: string;
  price: number;
  quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  owner_id: number;
  owner?: {
    id: number;
    username: string;
    full_name: string;
  };
}

interface ItemsResponse {
  items: Item[];
  total: number;
  skip: number;
  limit: number;
}
```

### Context/State Management

```typescript
// AuthContext for global authentication state
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}
```

---

## Docker Configuration

### File Structure
```
project/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── auth.py
│   └── routers/
│       ├── auth.py
│       └── items.py
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.js
    ├── public/
    └── src/
        ├── App.tsx
        ├── main.tsx
        ├── styles/
        │   ├── globals.scss
        │   ├── variables.scss
        │   ├── mixins.scss
        │   └── components/
        ├── components/
        ├── pages/
        ├── context/
        ├── types/
        └── utils/
```

### Environment Variables

**Backend** (`.env`):
```
DATABASE_URL=postgresql://admin:admin123@db:5432/crudapp
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Frontend** (`.env`):
```
REACT_APP_API_URL=http://localhost:8000
```

### Docker Commands

```bash
# Build and start all services
docker-compose up --build

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild specific service
docker-compose up --build backend

# Access PostgreSQL
docker exec -it postgres_db psql -U admin -d crudapp
```

---

## Security Requirements

1. **Password Security**:
   - Hash passwords with bcrypt (cost factor: 12)
   - Never store plain text passwords
   - Minimum 8 characters requirement

2. **JWT Security**:
   - Use HS256 algorithm
   - 30-minute token expiration
   - Include user ID and username in payload
   - Validate token on every protected endpoint

3. **API Security**:
   - CORS configuration (allow only frontend origin)
   - Rate limiting (optional but recommended)
   - Input validation and sanitization
   - SQL injection prevention (use ORM)
   - XSS prevention

4. **Frontend Security**:
   - Store JWT in memory or httpOnly cookies (not localStorage for production)
   - Clear sensitive data on logout
   - Validate user input before API calls
   - Implement CSRF protection for production

---

## Testing Requirements

### Backend Testing
- Unit tests for auth functions
- Integration tests for API endpoints
- Database transaction rollback in tests
- Test JWT generation and validation

### Frontend Testing
- Component rendering tests
- Form validation tests
- API integration tests (mocked)
- Protected route tests

---

## Performance Requirements

1. **Backend**:
   - API response time < 200ms for simple queries
   - Database connection pooling
   - Pagination for list endpoints
   - Efficient database indexes

2. **Frontend**:
   - First Contentful Paint < 1.5s
   - Debounced search input (300ms)
   - Lazy loading for routes
   - Optimized bundle size

---

## Development Workflow

1. Start Docker containers: `docker-compose up --build`
2. Backend runs on `http://localhost:8000`
3. Frontend runs on `http://localhost:3000`
4. Database runs on `localhost:5432`
5. API documentation available at `http://localhost:8000/docs` (Swagger UI)

---

## Production Considerations

1. Use environment-specific configuration
2. Implement proper logging (structured logs)
3. Add health check endpoints
4. Use production-grade WSGI server (Gunicorn)
5. Implement database migrations (Alembic)
6. Add monitoring and alerting
7. Use HTTPS/SSL certificates
8. Implement proper backup strategy
9. Add rate limiting and request throttling
10. Use secrets management system

---

## API Documentation

FastAPI automatically generates OpenAPI documentation:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

---

## Success Criteria

✅ User can signup, login, and reset password  
✅ JWT authentication working on all protected routes  
✅ Full CRUD operations on items (Create, Read, Update, Delete)  
✅ Advanced features: pagination, filtering, search, statistics  
✅ Modern, responsive UI with Tailwind CSS  
✅ Type-safe frontend with TypeScript  
✅ All services running in Docker containers  
✅ No external frontend libraries (using native Fetch API)  
✅ Proper error handling and validation  
✅ Database relationships (users ↔ items)  

---

**Estimated Development Time**: 2-3 days for full implementation  
**Lines of Code**: ~3,000-4,000 (backend + frontend + config)