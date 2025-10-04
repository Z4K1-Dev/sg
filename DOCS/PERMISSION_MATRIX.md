# Permission Matrix Documentation

This document outlines the permissions and access controls for different user roles in the application.

## User Roles

- **ADMIN**: Full access to all features and user management
- **OPERATOR**: Can manage content and reports, but not user accounts
- **USER**: Basic access to create reports and view content

## Permission Matrix

| Resource/Action | ADMIN | OPERATOR | USER |
|----------------|-------|----------|------|
| **User Management** |  |  |  |
| View all users | ✅ | ❌ | ❌ |
| Create user | ✅ | ❌ | ❌ |
| Update any user | ✅ | ❌ | ❌ |
| Delete user | ✅ | ❌ | ❌ |
| Change user roles | ✅ | ❌ | ❌ |
| **Content Management** |  |  |  |
| View posts | ✅ | ✅ | ✅ |
| Create posts | ✅ | ✅ | ❌ |
| Update posts | ✅ | ✅ | ❌ |
| Delete posts | ✅ | ✅ | ❌ |
| View pages | ✅ | ✅ | ✅ |
| Create pages | ✅ | ✅ | ❌ |
| Update pages | ✅ | ✅ | ❌ |
| Delete pages | ✅ | ✅ | ❌ |
| **Report Management** |  |  |  |
| View all reports | ✅ | ✅ | ✅ |
| Create reports | ✅ | ✅ | ✅ |
| Update reports | ✅ | ✅ | ❌ |
| Delete reports | ✅ | ✅ | ❌ |
| Change report status | ✅ | ✅ | ❌ |
| **System Settings** |  |  |  |
| View settings | ✅ | ✅ | ❌ |
| Update settings | ✅ | ❌ | ❌ |
| **Dashboard Access** |  |  |  |
| Admin Dashboard | ✅ | ❌ | ❌ |
| User Dashboard | ✅ | ✅ | ✅ |

## API Endpoint Protection

The following API endpoints are protected based on roles:

- `/api/admin/*` - ADMIN only
- `/api/users` - ADMIN only
- `/api/posts` - ADMIN and OPERATOR (with write permissions)
- `/api/reports` - All authenticated users (with different permissions based on action)

## Frontend Component Protection

Certain UI components and pages are protected based on roles:

- User Management UI (`/admin/users`) - ADMIN only
- Post Management UI (`/admin/posts`) - ADMIN and OPERATOR 
- Report Management UI (`/admin/reports`) - All authenticated users (with different capabilities)
- Settings UI (`/admin/settings`) - ADMIN only

## Implementation

Role-based access is enforced through:

1. Next.js Middleware - Checks roles at the routing level
2. API Route Guards - Verifies permissions in API endpoints
3. Component-Level Protection - HOCs and hooks to protect UI components
4. Database-Level Security - Prisma queries consider user roles in some scenarios

## Session Considerations

- Only authenticated users can access protected routes
- Users are redirected to login if unauthenticated
- Users are redirected to unauthorized page if they lack required permissions
- Session tokens are validated server-side