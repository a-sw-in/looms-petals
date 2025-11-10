# Admin Panel Setup Guide

## Production-Level Security Features

✅ **Bcrypt Password Hashing** - All passwords are hashed with bcrypt (12 salt rounds)
✅ **Secure Session Tokens** - Cryptographically secure random tokens
✅ **HTTP-Only Cookies** - Prevents XSS attacks
✅ **Strict Same-Site** - CSRF protection
✅ **Email Validation** - Format validation for all emails
✅ **Password Strength** - Minimum 8 characters required
✅ **Role-Based Access Control** - Admin verification on each request
✅ **Sensitive Data Filtering** - Passwords and tokens never returned in responses
✅ **Session Cleanup** - Automatic deletion of expired sessions
✅ **Admin Protection** - Cannot delete admin users

## Creating Your First Admin User

### Step 1: Hash Your Password

Run the password hashing script:

```bash
node scripts/hashPassword.js YourSecurePassword123
```

This will output:
- The hashed password
- A ready-to-use SQL INSERT statement

### Step 2: Create Admin in Supabase

Copy the generated SQL and run it in your Supabase SQL Editor:

```sql
INSERT INTO users (name, email, password, role) VALUES
('Admin Name', 'admin@yourdomain.com', '$2b$12$hashed_password_here', 'admin');
```

### Step 3: Access Admin Panel

1. Go to: `http://localhost:3000/admin/login`
2. Login with your admin credentials
3. Start managing products!

## API Endpoints

### Authentication
- `POST /api/admin/auth` - Login
- `GET /api/admin/auth` - Verify session
- `DELETE /api/admin/auth` - Logout

### Products
- `GET /api/admin/products` - List all products
- `GET /api/admin/products?id={id}` - Get single product
- `POST /api/admin/products` - Create product (Admin only)
- `PUT /api/admin/products?id={id}` - Update product (Admin only)
- `DELETE /api/admin/products?id={id}` - Delete product (Admin only)

### Users
- `GET /api/users` - List all users
- `GET /api/users?id={id}` - Get user by ID
- `GET /api/users?email={email}` - Get user by email
- `POST /api/users` - Create new user
- `PUT /api/users?id={id}` - Update user
- `DELETE /api/users?id={id}` - Delete user

## Security Best Practices Implemented

1. **Password Hashing**: Bcrypt with 12 salt rounds
2. **Secure Tokens**: Crypto.randomBytes(32) for session tokens
3. **Cookie Security**: HTTP-only, secure in production, strict SameSite
4. **Input Validation**: Email format, password length, required fields
5. **Role Verification**: Admin role checked on every protected route
6. **Sensitive Data**: Never expose passwords, tokens in responses
7. **Session Management**: Auto-cleanup of expired sessions
8. **Error Handling**: Proper error messages without exposing internals
9. **Role Escalation Prevention**: Cannot change role via update endpoint
10. **Admin Protection**: Cannot delete admin users

## Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (optional)
```

## Production Deployment Checklist

- [ ] Change default admin password
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS (secure cookies will automatically activate)
- [ ] Set up rate limiting (recommended)
- [ ] Enable Supabase Row Level Security policies
- [ ] Configure CORS if needed
- [ ] Set up monitoring and logging
- [ ] Regular security audits
- [ ] Implement password reset functionality
- [ ] Add two-factor authentication (optional)

## Troubleshooting

### "Invalid credentials" error
- Make sure you're using the correct hashed password
- Verify the email matches exactly (case-insensitive)
- Check that user role is 'admin'

### Session expires too quickly
- Default: 24 hours
- Modify in `/app/api/admin/auth/route.js`
- Look for: `Date.now() + 24 * 60 * 60 * 1000`

### Cannot access admin panel
- Check if admin user exists in database
- Verify email and role are correct
- Clear cookies and try again
- Check browser console for errors

## Support

For issues or questions, check:
1. Supabase dashboard for database errors
2. Browser console for client-side errors
3. Server logs for API errors
