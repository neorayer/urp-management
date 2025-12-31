# URP Management System

A comprehensive **User / Role / Permission (URP) Management System** built with:
- **Backend**: Spring Boot 3, Java 17, PostgreSQL/H2, Spring Security with JWT
- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite, React Query

## Features

### Core Capabilities
- ✅ **User Management**: CRUD operations, status management, ban/suspend users
- ✅ **Role-Based Access Control (RBAC)**: Create roles, assign permissions
- ✅ **Scoped Permissions**: GLOBAL, TENANT, PROJECT, RESOURCE scopes
- ✅ **Authentication & Authorization**: JWT-based auth, MFA support
- ✅ **Audit Logging**: Track all system activities with detailed logs
- ✅ **Session Management**: Track and revoke user sessions
- ✅ **Group Management**: Organize users into hierarchical groups

### Key Features from Requirements
- **Multi-tenancy Support**: Tenant isolation for B2B SaaS
- **Flexible Permission Model**: Resource-action based permissions (`users.read`, `orders.refund`)
- **Time-bound Role Grants**: Roles can expire automatically
- **System & Custom Roles**: Protected system roles + user-created roles
- **Comprehensive Audit Trail**: Immutable logs with IP tracking and user agent
- **Secure by Default**: BCrypt password hashing, JWT tokens, CORS protection

## Project Structure

```
urp-management/
├── backend/                 # Spring Boot 3 Application
│   ├── src/main/java/com/urp/management/
│   │   ├── config/         # Security, CORS, Data initialization
│   │   ├── controller/     # REST API endpoints
│   │   ├── domain/         # JPA entities and enums
│   │   ├── dto/            # Request/Response DTOs
│   │   ├── repository/     # Spring Data repositories
│   │   ├── security/       # JWT, UserDetails, Auth filters
│   │   └── service/        # Business logic layer
│   └── pom.xml
│
└── frontend/               # React + TypeScript + Vite
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── pages/          # Page components
    │   ├── services/       # API client functions
    │   ├── store/          # Zustand state management
    │   ├── types/          # TypeScript type definitions
    │   └── lib/            # Axios configuration
    └── package.json
```

## Getting Started

### Prerequisites
- **Java 17+**
- **Node.js 18+**
- **Maven 3.8+**
- **PostgreSQL** (optional, H2 included for development)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Run the application:
```bash
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

**Default Admin Credentials**:
- Email: `admin@urp.com`
- Password: `Admin@123`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/admin/users` - Search users (with filters)
- `GET /api/admin/users/{id}` - Get user by ID
- `POST /api/admin/users` - Create new user
- `PATCH /api/admin/users/{id}/status` - Update user status
- `POST /api/admin/users/{id}/ban` - Ban user
- `POST /api/admin/users/{id}/roles` - Assign role to user
- `DELETE /api/admin/users/{id}/roles/{roleId}` - Remove role from user

### Roles & Permissions
- `GET /api/admin/roles` - Get all roles
- `GET /api/admin/roles/{id}` - Get role by ID
- `POST /api/admin/roles` - Create new role
- `PUT /api/admin/roles/{id}/permissions` - Update role permissions
- `DELETE /api/admin/roles/{id}` - Delete role
- `GET /api/permissions` - Get all permissions

### Audit Logs
- `GET /api/admin/audit-logs` - Search audit logs (with filters)

## Database Schema

Key entities:
- **users**: User accounts with authentication
- **roles**: Named permission bundles
- **permissions**: Granular access permissions
- **user_roles**: M:N with scope support
- **groups**: Hierarchical user organization
- **sessions**: Active user sessions
- **audit_logs**: Immutable activity tracking
- **tenants**: Multi-tenancy support
- **mfa_factors**: Multi-factor authentication
- **invites**: User invitation system

## Security Features

- **Password Encryption**: BCrypt with configurable strength
- **JWT Tokens**: Secure, stateless authentication
- **MFA Support**: TOTP, SMS, Email, WebAuthn
- **CORS Protection**: Configurable allowed origins
- **Session Management**: Track and revoke active sessions
- **Audit Logging**: All actions logged with IP and user agent
- **Permission-based Authorization**: Fine-grained access control

## Tech Stack Details

### Backend
- **Spring Boot 3.2.1**: Modern Java framework
- **Spring Security**: Authentication & authorization
- **Spring Data JPA**: Database access
- **H2/PostgreSQL**: Development & production databases
- **JWT (jjwt 0.12.3)**: Token-based auth
- **Lombok**: Reduce boilerplate
- **MapStruct**: DTO mapping

### Frontend
- **React 18**: UI library
- **TypeScript**: Type safety
- **Vite**: Fast build tool
- **Tailwind CSS**: Utility-first styling
- **React Router**: Client-side routing
- **React Query**: Server state management
- **Zustand**: Global state management
- **Axios**: HTTP client
- **Lucide React**: Icon library

## Development

### Running Tests (Backend)
```bash
cd backend
mvn test
```

### Building for Production

**Backend**:
```bash
cd backend
mvn clean package
java -jar target/urp-management-1.0.0.jar
```

**Frontend**:
```bash
cd frontend
npm run build
# Serve the dist/ folder with your web server
```

## Configuration

### Backend Configuration (`application.yml`)
- Database connection
- JWT secret and expiration
- CORS allowed origins
- Password policy
- Session limits
- Audit log retention

### Frontend Configuration
- API base URL in `vite.config.ts`
- Axios interceptors in `lib/api.ts`

## Roadmap (MVP → Enterprise)

### ✅ MVP (Completed)
- User CRUD with status management
- Role CRUD with permission catalog
- User-role assignment (scoped)
- Session management
- Audit logs
- Basic admin UI

### 🚧 Next Phase (Enterprise-Ready)
- Groups with role inheritance
- SSO (OIDC/SAML)
- MFA implementation
- Scoped roles to specific resources
- Access review & expiry
- IP allowlist & geo policies

### 🔮 Advanced
- ABAC policy engine
- Approval workflows
- Device posture checking
- Admin analytics & drift reports

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Backend issues: Check Spring Boot logs
- Frontend issues: Check browser console
- Database issues: Check H2 console at `/h2-console`

---

**Built with ❤️ for universal User/Role/Permission management**
