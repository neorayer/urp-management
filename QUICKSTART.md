# Quick Start Guide

## Prerequisites Check
- ✅ Java 17+ installed
- ✅ Maven 3.8+ installed  
- ✅ Node.js 18+ installed

## Option 1: Quick Start Script (Recommended)

Make the script executable and run:
```bash
chmod +x start.sh
./start.sh
```

This will:
1. Start the backend on port 8080
2. Install frontend dependencies (if needed)
3. Start the frontend on port 5173

## Option 2: Manual Start

### Backend
```bash
cd backend
mvn spring-boot:run
```

### Frontend (in a new terminal)
```bash
cd frontend
npm install  # First time only
npm run dev
```

## Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **H2 Database Console**: http://localhost:8080/h2-console
  - JDBC URL: `jdbc:h2:mem:urpdb`
  - Username: `sa`
  - Password: (leave empty)

## Default Login Credentials

```
Email: admin@urp.com
Password: Admin@123
```

## Initial Setup

The system will automatically:
1. Create the database schema
2. Initialize default permissions
3. Create system roles (Super Admin, User Manager, Auditor)
4. Create the default admin user

## Testing the API

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@urp.com","password":"Admin@123"}'
```

### Get Users (with JWT token)
```bash
curl http://localhost:8080/api/admin/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## What's Available

### Pages
- **Dashboard**: Overview and quick stats
- **Users**: List, search, create, view details, assign roles
- **Roles**: List, view permissions, manage roles
- **Audit Logs**: Track all system activities

### Features
- JWT-based authentication
- Role-based access control
- Scoped permissions (GLOBAL, TENANT, PROJECT, RESOURCE)
- Session management
- Comprehensive audit logging
- User status management (Active, Suspended, Banned)

## Development

### Backend Hot Reload
Spring Boot DevTools is included for automatic restart on code changes.

### Frontend Hot Reload
Vite provides instant hot module replacement (HMR).

## Next Steps

1. **Explore the UI**: Login and navigate through all pages
2. **Create Users**: Add new users with different roles
3. **Manage Roles**: Create custom roles with specific permissions
4. **Review Audit Logs**: See all tracked activities
5. **Test API**: Use the REST endpoints directly

## Troubleshooting

### Port Already in Use
If port 8080 or 5173 is in use:
- Backend: Change `server.port` in `backend/src/main/resources/application.yml`
- Frontend: Change port in `frontend/vite.config.ts`

### Database Issues
The system uses H2 in-memory database by default. Data is lost on restart.
To use PostgreSQL, update `application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/urpdb
    username: your_username
    password: your_password
```

### Build Errors
- Backend: `mvn clean install`
- Frontend: `rm -rf node_modules && npm install`

## Documentation

- Full README: See `/README.md`
- API Documentation: Available at runtime (Swagger can be added)
- Database Schema: See entity classes in `/backend/src/main/java/com/urp/management/domain/entity/`

---

**Ready to explore? Start the app and login with the default credentials!** 🚀
