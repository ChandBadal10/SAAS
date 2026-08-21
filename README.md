# SaaS Backend API

A secure and scalable backend API for a SaaS application built with **NestJS**, **Prisma ORM**, and **PostgreSQL**.

The project provides complete authentication and user-management functionality including JWT authentication, refresh-token authentication, email verification, forgot-password with OTP, role-based authorization, profile management, password management, and admin-controlled account activation/deactivation.

---

## 🚀 Features

### Authentication

* User registration
* Email verification
* Resend email verification
* User login
* JWT access token authentication
* JWT refresh token authentication
* Logout
* Get authenticated user
* Forgot password
* Password reset using OTP
* Change password
* Secure password hashing with bcrypt

### Authorization

* Role-based access control
* `USER` role
* `ADMIN` role
* Protected routes using JWT Guards
* Admin-only routes
* User-only routes

### User Management

* Get current user's profile
* Update current user's profile
* Change current user's password
* Get all users
* Get a single user
* Admin can activate/deactivate user accounts
* Inactive users cannot login
* Refresh tokens are invalidated when an account is deactivated

### Database

* PostgreSQL database
* Prisma ORM
* Prisma migrations
* Prisma seed
* Default admin account
* UUID-based user IDs

### Email

* SMTP email integration
* Email verification
* Password reset OTP
* Resend verification email

---

# 🛠️ Tech Stack

| Technology        | Purpose                 |
| ----------------- | ----------------------- |
| NestJS            | Backend framework       |
| TypeScript        | Programming language    |
| Prisma            | ORM                     |
| PostgreSQL        | Database                |
| JWT               | Authentication          |
| Passport          | Authentication strategy |
| bcrypt            | Password hashing        |
| class-validator   | Request validation      |
| class-transformer | DTO transformation      |
| Nodemailer        | Email service           |
| Brevo SMTP        | Email delivery          |
| dotenv            | Environment variables   |

---

# 📁 Project Structure

```text
server/
│
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
│
├── src/
│   │
│   ├── auth/
│   │   ├── decorators/
│   │   │   └── roles.decorator.ts
│   │   │
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   ├── register.dto.ts
│   │   │   ├── refresh-token.dto.ts
│   │   │   ├── forgot-password.dto.ts
│   │   │   ├── verify-reset-otp.dto.ts
│   │   │   └── reset-password.dto.ts
│   │   │
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   │
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   │
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   │
│   ├── users/
│   │   ├── dto/
│   │   │   ├── update-profile.dto.ts
│   │   │   └── update-user-status.dto.ts
│   │   │
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   │
│   ├── prisma/
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   │
│   ├── email/
│   │   ├── email.service.ts
│   │   └── email.module.ts
│   │
│   ├── app.module.ts
│   └── main.ts
│
├── .env
├── .gitignore
├── package.json
├── prisma.config.ts
└── README.md
```

---

# ⚙️ Installation

## 1. Clone the repository

```bash
git clone <your-repository-url>
```

Move into the project:

```bash
cd server
```

---

## 2. Install dependencies

```bash
npm install
```

---

# 🔐 Environment Variables

Create a `.env` file in the root directory.

```env
DATABASE_URL="your-postgresql-database-url"

# Admin
ADMIN_EMAIL="admin@saas.com"
ADMIN_PASSWORD="your-secure-admin-password"

# SMTP
SMTP_HOST="smtp-relay.brevo.com"
SMTP_PORT=587
SMTP_USER="your-smtp-user"
SMTP_PASS="your-smtp-password"
SENDER_EMAIL="your-email@example.com"

# JWT
JWT_ACCESS_SECRET="your-access-secret"
JWT_REFRESH_SECRET="your-refresh-secret"

JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
```

### Important

Never commit `.env` to Git.

Add this to `.gitignore`:

```gitignore
.env
.env.local
.env.production
node_modules/
dist/
```

---

# 🗄️ Database Setup

This project uses PostgreSQL with Prisma.

After configuring `DATABASE_URL`, run:

```bash
npx prisma generate
```

Run the database migration:

```bash
npx prisma migrate dev
```

---

# 🌱 Database Seed

The project includes a seed file for creating the default administrator account.

Run:

```bash
npm run db:seed
```

The seed uses the credentials defined in:

```env
ADMIN_EMAIL="admin@saas.com"
ADMIN_PASSWORD="your-secure-admin-password"
```

The admin account is created with:

```text
Role: ADMIN
Email Verified: true
Active: true
```

The seed should be safe to run multiple times by checking whether the admin already exists.

---

# ▶️ Running the Application

## Development

```bash
npm run start:dev
```

The API will run on:

```text
http://localhost:3000
```

If your project uses another port, update the URL accordingly.

---

## Production

Build the project:

```bash
npm run build
```

Start the application:

```bash
npm run start:prod
```

---

# 🔑 Authentication Flow

## Registration

```text
User
 ↓
Register
 ↓
Password hashed with bcrypt
 ↓
User created
 ↓
Verification email sent
 ↓
User verifies email
 ↓
Account becomes verified
```

---

## Login

```text
Login
 ↓
Find user
 ↓
Check password
 ↓
Check account status
 ↓
Check email verification
 ↓
Generate Access Token
 ↓
Generate Refresh Token
 ↓
Store hashed refresh token
 ↓
Return authentication response
```

---

# 🎟️ JWT Authentication

The application uses two tokens.

### Access Token

Used for accessing protected API endpoints.

Default expiration:

```text
15 minutes
```

Example request:

```http
Authorization: Bearer <access-token>
```

### Refresh Token

Used to generate a new access token after the access token expires.

Default expiration:

```text
7 days
```

Refresh tokens are stored securely as hashes in the database.

---

# 👥 Roles

The application currently supports two roles:

```text
USER
ADMIN
```

## USER

A normal authenticated user can:

* View their profile
* Update their profile
* Change their password
* Use authenticated user features

## ADMIN

The administrator can:

* View all users
* View a specific user
* Activate users
* Deactivate users
* Access admin-only endpoints

The administrator does not modify the user's personal profile information.

---

# 🛡️ Role-Based Authorization

Protected admin endpoints use:

```text
JwtAuthGuard
+
RolesGuard
+
@Roles(Role.ADMIN)
```

Example:

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
```

This ensures that:

1. The request contains a valid JWT.
2. The JWT contains valid user information.
3. The user has the required role.

---

# 👤 User Account Status

Every user has an `isActive` property.

```text
isActive = true
```

means the account is active.

```text
isActive = false
```

means the account is deactivated.

An inactive user cannot login.

When an administrator deactivates a user:

```text
User Account
     ↓
isActive = false
     ↓
refreshTokenHash = null
     ↓
User cannot login
```

---

# 📡 API Endpoints

Base URL:

```text
/api
```

---

## 🔐 Authentication APIs

### Register

```http
POST /api/auth/register
```

Creates a new user account.

---

### Verify Email

```http
POST /api/auth/verify-email
```

Verifies the user's email address.

---

### Resend Verification

```http
POST /api/auth/resend-verification
```

Sends a new verification email.

---

### Login

```http
POST /api/auth/login
```

Authenticates the user and returns access and refresh tokens.

---

### Get Current Authenticated User

```http
GET /api/auth/me
```

Requires authentication.

---

### Refresh Token

```http
POST /api/auth/refresh
```

Generates a new access token.

---

### Logout

```http
POST /api/auth/logout
```

Logs the authenticated user out and invalidates the refresh token.

---

### Forgot Password

```http
POST /api/auth/forgot-password
```

Sends a password reset OTP.

---

### Verify Reset OTP

```http
POST /api/auth/verify-reset-otp
```

Verifies the password reset OTP.

---

### Reset Password

```http
POST /api/auth/reset-password
```

Resets the user's password.

---

### User Only

```http
GET /api/auth/user-only
```

Accessible only to authenticated users with the `USER` role.

---

### Admin Only

```http
GET /api/auth/admin-only
```

Accessible only to authenticated administrators.

---

# 👤 User APIs

Base route:

```text
/api/users
```

---

### Get My Profile

```http
GET /api/users/me
```

Requires:

```text
Bearer Access Token
```

Returns the authenticated user's profile.

---

### Update My Profile

```http
PATCH /api/users
```

Requires authentication.

Users can update:

```json
{
  "firstName": "Badal",
  "lastName": "Chand",
  "email": "badal@example.com"
}
```

---

### Change Password

```http
PATCH /api/users/change-password
```

Requires authentication.

Example:

```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword123"
}
```

---

# 👑 Admin User Management APIs

### Get All Users

```http
GET /api/users
```

Requires:

```text
ADMIN
```

---

### Get Single User

```http
GET /api/users/:id
```

Requires:

```text
ADMIN
```

Example:

```http
GET /api/users/9e8b3bc8-956e-45e0-be25-6d064a95ff18
```

---

### Activate / Deactivate User

```http
PATCH /api/users/:id/status
```

Requires:

```text
ADMIN
```

Deactivate:

```json
{
  "isActive": false
}
```

Activate:

```json
{
  "isActive": true
}
```

---

# 🧪 Testing With Postman

Recommended testing order:

```text
1. Register
       ↓
2. Verify Email
       ↓
3. Login
       ↓
4. Get Profile
       ↓
5. Update Profile
       ↓
6. Change Password
       ↓
7. Refresh Token
       ↓
8. Logout
       ↓
9. Forgot Password
       ↓
10. Verify OTP
       ↓
11. Reset Password
       ↓
12. Login as Admin
       ↓
13. Get All Users
       ↓
14. Get Single User
       ↓
15. Deactivate User
       ↓
16. Try Login as Deactivated User
       ↓
17. Activate User
       ↓
18. Login Again
```

---

# 🔒 Security

The application implements several security mechanisms:

* Password hashing using bcrypt
* JWT access tokens
* JWT refresh tokens
* Hashed refresh tokens in database
* Email verification
* OTP-based password reset
* Role-based authorization
* Protected routes
* Account activation/deactivation
* DTO validation
* Environment-based secrets
* Sensitive user fields excluded from API responses

---

# 🧩 Validation

DTOs use `class-validator`.

Example:

```typescript
@IsEmail()
email: string;
```

```typescript
@IsString()
@MinLength(2)
@MaxLength(50)
firstName: string;
```

This prevents invalid request data from reaching the service layer.

---

# 🗃️ Database Model

The main `User` model contains:

```text
User
│
├── id
├── firstName
├── lastName
├── email
├── passwordHash
├── createdAt
├── updatedAt
├── isActive
├── isEmailVerified
├── role
└── refreshTokenHash
```

Additional models support:

```text
OTP Requests
Password Reset Tokens
Verification Tokens
```

---

# 🏗️ Architecture

The backend follows the NestJS modular architecture.

```text
                    Client
                      │
                      ▼
                  Controller
                      │
                      ▼
                    Guard
                      │
                      ▼
                    DTO
                      │
                      ▼
                   Service
                      │
                      ▼
                    Prisma
                      │
                      ▼
                 PostgreSQL
```

Authentication:

```text
Client
  │
  │ Authorization: Bearer JWT
  ▼
JwtAuthGuard
  │
  ▼
JwtStrategy
  │
  ▼
JWT Payload
  │
  ▼
RolesGuard
  │
  ▼
Controller
```

---

# 📜 Available Scripts

```bash
# Start development server
npm run start:dev

# Build project
npm run build

# Start production server
npm run start:prod

# Run database seed
npm run db:seed

# Generate Prisma Client
npx prisma generate

# Create and apply migration
npx prisma migrate dev

# Open Prisma Studio
npx prisma studio
```

---

# 🌱 Development Workflow

When changing the Prisma schema:

```bash
npx prisma migrate dev --name your_migration_name
```

Then regenerate Prisma Client if required:

```bash
npx prisma generate
```

Start the development server:

```bash
npm run start:dev
```

Test the API using Postman.

---

# 🚧 Future Improvements

The following features can be added as the project grows:

* Pagination
* User search
* User filtering
* Sorting
* Admin dashboard APIs
* Audit logs
* Rate limiting
* Login attempt tracking
* Account lockout
* Two-factor authentication
* Social authentication
* Advanced permission system
* API documentation with Swagger
* Docker support
* Automated testing
* CI/CD
* Production deployment
* Redis caching
* Background jobs

---

# 📌 Current Project Status

### Authentication

* [x] Registration
* [x] Email verification
* [x] Resend verification
* [x] Login
* [x] JWT access token
* [x] Refresh token
* [x] Logout
* [x] Forgot password
* [x] OTP verification
* [x] Password reset
* [x] Change password

### Authorization

* [x] JWT Guard
* [x] Roles Guard
* [x] USER role
* [x] ADMIN role
* [x] Admin-only routes
* [x] User-only routes

### User Management

* [x] Get own profile
* [x] Update own profile
* [x] Get all users
* [x] Get single user
* [x] Activate user
* [x] Deactivate user
* [x] Prevent inactive users from logging in

### Database

* [x] PostgreSQL
* [x] Prisma
* [x] Migrations
* [x] Seed file
* [x] Default admin

---

# 👨‍💻 Author

**Badal Chand**

Full Stack Developer

Built with:

```text
NestJS + TypeScript + Prisma + PostgreSQL
```

---

# 📄 License

This project is for learning and development purposes.
