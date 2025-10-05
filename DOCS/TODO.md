# TODO List - Blog & Reporting System (Admin Dashboard Focus)

## Legend Status
  - 🔄 = for active tasks
  - ✅ = Done / when finished
  - ❌ = Failed / Error / Need to fix it

## 🚀 Phase 1: Project Setup & Foundation

### 1.1 Project Initialization
- [x] Update package.json with new dependencies for admin dashboard
- [x] Install tRPC and superjson for type-safe API (@trpc/server, @trpc/client, @trpc/react-query, superjson)
- [x] Install Auth.js for authentication
- [x] Install CKEditor 5 for post editing (@ckeditor/ckeditor5-react, @ckeditor/ckeditor5-build-classic)
- [x] Install TinaCMS for page editing (tinacms)
- [x] Install image processing libraries (browser-image-compression)
- [x] Install export libraries (jspdf, xlsx)
- [x] Install utility libraries (date-fns-tz, mime-types, node-cron)
- [x] Install shadcn/ui additional components if needed
- [x] Configure TypeScript settings for strict mode
- [x] Set up ESLint and Prettier configuration
- [x] Update Next.js configuration for production build
- [x] Do final check : npm run lint, npx tsc --noEmit, rm -rf .next, npm cache clean --force and npm run build

### 1.2 Database Setup
- [x] Design and implement Prisma schema for admin dashboard
  - [x] Users table (id, email, name, role, created_at, updated_at, deleted_at)
  - [x] Categories table (id, name, slug, type, description, timestamps, deleted_at)
  - [x] Tags table (id, name, slug, timestamps, deleted_at)
  - [x] Posts table (id, title, slug, content, excerpt, category_id, type, status, meta_title, meta_description, author_id, published_at, timestamps, deleted_at)
  - [x] Post tags junction table
  - [x] Media folders table
  - [x] Media table
  - [x] Statuses table (dynamic)
  - [x] Reports table
  - [x] Report attachments table
  - [x] Report responses table
  - [x] Settings table
  - [x] Notifications table
  - [x] Activity logs table
  - [x] Backups table
- [x] Create database migrations
- [x] Set up database connection and client
- [x] Create seed data for initial setup (admin user, basic categories, default statuses)
- [x] Test database operations and connections
- [x] Implement soft delete functionality with Prisma queries
- [x] Create database utility functions (CRUD helpers, pagination, search)
- [x] Do final check : npm run lint, npx tsc --noEmit, rm -rf .next, npm cache clean --force and npm run build

### 1.3 Environment Configuration
- [x] Set up environment variables (.env.local)
  - [x] Database URL
  - [x] Auth.js configuration
  - [x] Google OAuth credentials
  - [x] NextAuth secret
  - [x] File upload paths
  - [x] Image processing settings
- [x] Configure development and production environments
- [x] Set up CORS and security headers
- [x] Create environment validation schema
- [x] Do final check : npm run lint, npx tsc --noEmit, rm -rf .next, npm cache clean --force and npm run build

## 🔐 Phase 2: Authentication & Authorization

### 2.1 Auth.js Configuration
- [x] Install and configure Auth.js
- [x] Set up Google OAuth provider with proper credentials
- [x] Configure email/password registration system
- [x] Create custom authentication pages (login, register)
- [x] Implement session management with proper cookies
- [x] Set up JWT token handling
- [x] Configure authentication middleware for admin routes
- [x] Create custom login page with shadcn/ui components
- [x] Set up session timeout and refresh logic
- [x] Do final check : npm run lint, npx tsc --noEmit, rm -rf .next, npm cache clean --force and npm run build

### 2.2 User Management System
- [x] Create user registration API endpoints (/api/auth/register)
- [x] Implement user login/logout functionality (/api/auth/login, /api/auth/logout)
- [x] Create user profile management API (/api/users/profile)
- [x] Implement role-based access control (Admin, Operator, User)
- [x] Create user dashboard components
- [x] Set up password reset functionality
- [x] Implement user avatar upload system
- [x] Create user activity tracking
- [x] Set up user session management
- [x] Do final check : npm run lint, npx tsc --noEmit, rm -rf .next, npm cache clean --force and npm run build

### 2.3 Authorization System
- [x] Create role-based middleware function
- [x] Implement route protection for admin pages
- [x] Create permission checking utilities
- [x] Set up API endpoint authorization
- [x] Create admin access controls
- [x] Implement user role management UI
- [x] Test authorization flows for all user roles
- [x] Create permission matrix documentation
- [x] Do final check : npm run lint, npx tsc --noEmit, rm -rf .next, npm cache clean --force and npm run build

## 🎨 Phase 3: Admin Dashboard Foundation

### 3.1 Dashboard Layout Structure
- [x] Create main admin dashboard layout component (/src/components/admin/DashboardLayout.tsx)
- [x] Implement responsive sidebar navigation with shadcn/ui
  - [x] Dashboard item
  - [x] Posts management item
  - [x] Pages management item
  - [x] Categories management item
  - [x] Tags management item
  - [x] Media management item
  - [x] Reports management item
  - [x] Users management item
  - [x] Settings item
  - [x] Logout item
- [x] Create header with user menu and notifications
- [x] Set up breadcrumb navigation system
- [x] Create loading and error states for dashboard
- [x] Implement dark mode toggle with shadcn/ui
- [x] Create mobile-responsive navigation menu
- [x] Set up dashboard routing structure
- [x] Do final check : npm run lint, npx tsc --noEmit, rm -rf .next, npm cache clean --force and npm run build

### 3.2 Dashboard Components
- [x] Create statistics cards component (posts count, pages count, reports count, users count)
- [x] Implement activity feed component showing recent actions
- [x] Create chart components using shadcn/ui + recharts (posts over time, reports by status)
- [x] Set up quick actions component (create post, create page, view reports)
- [x] Create notification center with unread count badge
- [x] Implement global search functionality
- [x] Create filter and sort components for lists
- [x] Set up dashboard refresh functionality
- [x] Do final check : npm run lint, npx tsc --noEmit, rm -rf .next, npm cache clean --force and npm run build

### 3.3 Common UI Components
- [x] Create reusable data table component with pagination
- [x] Implement modal/dialog components using shadcn/ui
- [x] Create form validation components with react-hook-form
- [x] Set up file upload components with progress indicators
- [x] Create image preview components
- [x] Implement loading skeletons for better UX
- [x] Create confirmation dialogs for delete actions
- [x] Set up toast notifications for user feedback
- [x] Create empty state components
- [x] Implement error boundary components
- [x] Do final check : npm run lint, npx tsc --noEmit, rm -rf .next, npm cache clean --force and npm run build

## 📝 Phase 4: Posts Management System

### 4.1 Core Architecture Setup
- [x] Set up tRPC server configuration with Prisma integration
- [x] Create shared Zod schemas for posts validation
- [x] Configure superjson for tRPC data serialization
- [x] Set up Socket.io server with Zod validation
- [x] Create Socket.io event schemas with Zod
- [x] Implement Socket.io trigger system for real-time notifications
- [x] Set up tRPC client configuration with React Query
- [x] Create Socket.io client connection management
- [x] Test tRPC + Socket.io integration
- [x] Do final check : npm run lint, npx tsc --noEmit, rm -rf .next, npm cache clean --force and npm run build

### 4.2 Posts API Development with tRPC
- [x] Create posts tRPC router with CRUD procedures
  - [x] posts.getAll (list with pagination, search, filtering)
  - [x] posts.getById (single post)
  - [x] posts.create (create new post)
  - [x] posts.update (update post)
  - [x] posts.delete (soft delete)
  - [x] posts.bulk (bulk actions)
- [x] Implement post search and filtering with tRPC
- [x] Create post category management tRPC procedures
- [x] Implement tag management tRPC procedures
- [x] Set up post status management with tRPC
- [x] Create post validation schemas with Zod (shared)
- [x] Implement post SEO metadata handling with tRPC
- [x] Add post activity logging with tRPC
- [x] Do final check : npm run lint, npx tsc --noEmit, rm -rf .next, npm cache clean --force and npm run build

### 4.3 Posts UI Components
- [x] Create posts list page with filtering and search (/src/app/admin/posts/page.tsx)
- [x] Implement post creation form with shadcn/ui components
- [x] Set up CKEditor 5 integration for rich text editing
  - [x] Configure toolbar with formatting options
  - [x] Set up image insertion from media library
  - [x] Implement link insertion functionality
  - [x] Add table creation support
  - [x] Configure source code viewing
- [x] Create post editing interface with autosave
- [x] Implement category selection component with dropdown
- [x] Create tag management interface with autocomplete
- [x] Set up post preview functionality
- [x] Create post SEO metadata form
- [x] Implement post publishing workflow
- [x] Do final check : npm run lint, npx tsc --noEmit, rm -rf .next, npm cache clean --force and npm run build

### 4.4 Posts Features with Real-time Updates
- [x] Implement draft/published status toggle with Socket.io triggers
- [x] Create post duplication feature with real-time notifications
- [x] Implement bulk actions with Socket.io progress updates
- [x] Create post revision history system with real-time sync
- [x] Implement advanced post search functionality
- [x] Set up post export features (JSON, CSV)
- [x] Add real-time collaboration indicators (who is editing)
- [x] Do final check : npm run lint, npx tsc --noEmit, rm -rf .next, npm cache clean --force and npm run build

## 📄 Phase 5: Pages Management System

### 5.1 Pages API Development
- [ ] Create pages CRUD API endpoints
  - [ ] GET /api/pages (list with hierarchy)
  - [ ] GET /api/pages/[id] (single page)
  - [ ] POST /api/pages (create new page)
  - [ ] PUT /api/pages/[id] (update page)
  - [ ] DELETE /api/pages/[id] (soft delete)
- [ ] Implement page hierarchy management (parent/child relationships)
- [ ] Create page template system API
- [ ] Set up page status management (draft, published)
- [ ] Implement page validation schemas
- [ ] Create page SEO metadata handling
- [ ] Set up page ordering system
- [ ] Add page activity logging

### 5.2 Pages UI Components
- [ ] Create pages list with hierarchy view (/src/app/admin/pages/page.tsx)
- [ ] Implement page creation form with parent selection
- [ ] Set up TinaCMS integration for page editing
  - [ ] Configure TinaCMS for page editing
  - [ ] Set up inline editing capabilities
  - [ ] Implement sidebar editing panel
  - [ ] Add media library integration
  - [ ] Configure preview mode
- [ ] Create page editing interface with live preview
- [ ] Implement page template selection component
- [ ] Set up page organization features (drag & drop ordering)
- [ ] Create page SEO metadata form
- [ ] Implement page publishing workflow

### 5.3 Pages Features
- [ ] Implement page parent/child relationships management
- [ ] Create page template management system
- [ ] Set up page menu integration
- [ ] Implement page versioning system
- [ ] Create page bulk operations
- [ ] Implement page search functionality
- [ ] Set up page navigation management
- [ ] Create page analytics (views, engagement)

### 5.4 Pages Features
- [ ] Do final check : npm run lint, npx tsc --noEmit, rm -rf .next, npm cache clean --force and npm run build

## 📁 Phase 6: Media Management System

### 6.1 Media API Development
- [ ] Create media upload API endpoints
  - [ ] POST /api/media/upload (single file)
  - [ ] POST /api/media/upload/bulk (multiple files)
  - [ ] GET /api/media (list with pagination, search, filtering)
  - [ ] GET /api/media/[id] (single media item)
  - [ ] DELETE /api/media/[id] (delete media)
- [ ] Implement folder management API
  - [ ] GET /api/media/folders (list folders)
  - [ ] POST /api/media/folders (create folder)
  - [ ] PUT /api/media/folders/[id] (rename folder)
  - [ ] DELETE /api/media/folders/[id] (delete folder)
- [ ] Set up file validation and processing
- [ ] Create media search and filtering
- [ ] Implement media metadata handling
- [ ] Set up media deletion and recovery
- [ ] Create media optimization settings API
- [ ] Do final check : npm run lint, npx tsc --noEmit, rm -rf .next, npm cache clean --force and npm run build

### 6.2 Client-side Image Processing
- [ ] Implement browser-image-compression library
- [ ] Set up WebP conversion with JPG fallback
- [ ] Create image resize functionality (maintain aspect ratio)
- [ ] Implement quality compression with slider control
- [ ] Set up file type validation (images: JPG, PNG, GIF, WebP; documents: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX)
- [ ] Create upload progress indicators
- [ ] Implement drag-and-drop upload interface
- [ ] Set up multiple file upload support
- [ ] Create image preview before upload
- [ ] Implement file size validation (max 50MB)
- [ ] Do final check : npm run lint, npx tsc --noEmit, rm -rf .next, npm cache clean --force and npm run build

### 6.3 Media UI Components
- [ ] Create media library interface (/src/app/admin/media/page.tsx)
- [ ] Implement folder tree navigation component
- [ ] Create media grid/list view toggle
- [ ] Set up media preview modal with details
- [ ] Implement media selection component (single/multiple)
- [ ] Create media upload interface with progress
- [ ] Set up media management tools (rename, delete, move)
- [ ] Create media search and filtering
- [ ] Implement media bulk operations
- [ ] Set up media folder organization
- [ ] Do final check : npm run lint, npx tsc --noEmit, rm -rf .next, npm cache clean --force and npm run build

### 6.4 Media Settings
- [ ] Create image processing settings UI (/src/app/admin/settings/media/page.tsx)
- [ ] Implement max image size configuration (slider 100px - 2000px)
- [ ] Set up quality slider control (10% - 100%)
- [ ] Create file type restrictions interface
- [ ] Implement storage quota management
- [ ] Set up media optimization options
- [ ] Create media backup settings
- [ ] Implement media cleanup utilities
- [ ] Set up media analytics dashboard
- [ ] Do final check : npm run lint, npx tsc --noEmit, rm -rf .next, npm cache clean --force and npm run build

## 🎫 Phase 7: Reporting System

### 7.1 Reports API Development with tRPC & Socket.io
- [ ] Create reports tRPC router with CRUD procedures
  - [ ] reports.getAll (list with pagination, search, filtering)
  - [ ] reports.getById (single report)
  - [ ] reports.create (create new report)
  - [ ] reports.update (update report)
  - [ ] reports.delete (soft delete)
- [ ] Implement status management with tRPC
- [ ] Set up report attachment handling with tRPC
- [ ] Create report response system with tRPC
- [ ] Implement location data handling (lat, lng, address) with tRPC
- [ ] Set up report search and filtering with tRPC
- [ ] Create report export functionality (PDF, Excel) with tRPC
- [ ] Add report activity logging with tRPC
- [ ] Implement Socket.io triggers for report status updates
- [ ] Set up real-time report notifications via Socket.io
- [ ] Do final check : npm run lint, npx tsc --noEmit, rm -rf .next, npm cache clean --force and npm run build

### 7.2 Dynamic Status System with tRPC & Socket.io
- [ ] Create status management tRPC router
  - [ ] statuses.getAll (list all statuses)
  - [ ] statuses.create (create new status)
  - [ ] statuses.update (update status)
  - [ ] statuses.delete (delete status)
- [ ] Implement dynamic status creation/deletion with tRPC
- [ ] Set up status ordering system with tRPC
- [ ] Create status color customization with tRPC
- [ ] Implement status workflow rules with tRPC
- [ ] Set up status transition validation with tRPC
- [ ] Create status analytics with tRPC
- [ ] Add default statuses seed data (Baru, Diproses, Ditunda, Selesai)
- [ ] Implement Socket.io triggers for status changes
- [ ] Set up real-time status update notifications
- [ ] Do final check : npm run lint, npx tsc --noEmit, rm -rf .next, npm cache clean --force and npm run build

### 7.3 Reports UI Components with Real-time Updates
- [ ] Create reports list with status filtering (/src/app/admin/reports/page.tsx)
- [ ] Implement report creation form
  - [ ] Title input field
  - [ ] Description textarea
  - [ ] Location picker with map integration
  - [ ] File attachment component
  - [ ] Category selection
  - [ ] Priority level (if needed)
- [ ] Set up location picker component
  - [ ] Map integration for location selection
  - [ ] Address autocomplete
  - [ ] Lat/Lng coordinate display
  - [ ] Current location detection
- [ ] Create file attachment interface
- [ ] Implement report detail view with timeline
- [ ] Create response management interface
- [ ] Set up report status management UI
- [ ] Do final check : npm run lint, npx tsc --noEmit, rm -rf .next, npm cache clean --force and npm run build

### 7.4 Reports Features with Real-time Updates
- [ ] Implement report assignment system with Socket.io notifications
- [ ] Create report notification system with real-time triggers
- [ ] Set up report analytics dashboard with live updates
- [ ] Implement report export (PDF/Excel) with progress notifications
- [ ] Create report search functionality with real-time results
- [ ] Implement report filtering options with instant updates
- [ ] Set up report archiving system with status notifications
- [ ] Create report workflow automation with real-time tracking
- [ ] Implement report SLA tracking with deadline notifications
- [ ] Add real-time collaboration features for report handling
- [ ] Do final check : npm run lint, npx tsc --noEmit, rm -rf .next, npm cache clean --force and npm run build

## 🏷️ Phase 8: Categories & Tags Management

### 8.1 Categories API Development
- [ ] Create categories CRUD API endpoints
  - [ ] GET /api/categories (list with type filtering)
  - [ ] GET /api/categories/[id] (single category)
  - [ ] POST /api/categories (create new category)
  - [ ] PUT /api/categories/[id] (update category)
  - [ ] DELETE /api/categories/[id] (soft delete)
- [ ] Implement category type management (post, page)
- [ ] Set up category validation schemas
- [ ] Create category search functionality
- [ ] Add category activity logging
- [ ] Do final check : npm run lint, npx tsc --noEmit, rm -rf .next, npm cache clean --force and npm run build

### 8.2 Categories UI Components
- [ ] Create categories list page (/src/app/admin/categories/page.tsx)
- [ ] Implement category creation form
- [ ] Set up category editing interface
- [ ] Create category type selection (post/page)
- [ ] Implement category deletion with confirmation
- [ ] Set up category search and filtering
- [ ] Create category usage statistics
- [ ] Implement category bulk operations
- [ ] Do final check : npm run lint, npx tsc --noEmit, rm -rf .next, npm cache clean --force and npm run build

### 8.3 Tags API Development
- [ ] Create tags CRUD API endpoints
  - [ ] GET /api/tags (list with search)
  - [ ] GET /api/tags/[id] (single tag)
  - [ ] POST /api/tags (create new tag)
  - [ ] PUT /api/tags/[id] (update tag)
  - [ ] DELETE /api/tags/[id] (soft delete)
- [ ] Implement tag validation schemas
- [ ] Set up tag search functionality
- [ ] Create tag usage analytics
- [ ] Add tag activity logging
- [ ] Do final check : npm run lint, npx tsc --noEmit, rm -rf .next, npm cache clean --force and npm run build

### 8.4 Tags UI Components
- [ ] Create tags list page (/src/app/admin/tags/page.tsx)
- [ ] Implement tag creation form
- [ ] Set up tag editing interface
- [ ] Create tag deletion with confirmation
- [ ] Implement tag search functionality
- [ ] Set up tag usage statistics
- [ ] Create tag bulk operations
- [ ] Implement tag merge functionality
- [ ] Do final check : npm run lint, npx tsc --noEmit, rm -rf .next, npm cache clean --force and npm run build

## 👥 Phase 9: User Management System

### 9.1 User Management API
- [ ] Create user management API endpoints
  - [ ] GET /api/users (list with pagination, search, role filtering)
  - [ ] GET /api/users/[id] (single user)
  - [ ] PUT /api/users/[id] (update user)
  - [ ] DELETE /api/users/[id] (soft delete)
  - [ ] PUT /api/users/[id]/role (change user role)
- [ ] Implement user search and filtering
- [ ] Set up user role management
- [ ] Create user activity tracking
- [ ] Add user management logging
- [ ] Do final check : npm run lint, npx tsc --noEmit, rm -rf .next, npm cache clean --force and npm run build

### 9.2 User Management UI
- [ ] Create users list page (/src/app/admin/users/page.tsx)
- [ ] Implement user search and filtering
- [ ] Set up user role assignment interface
- [ ] Create user detail view with activity
- [ ] Implement user status management
- [ ] Set up user bulk operations
- [ ] Create user analytics dashboard
- [ ] Implement user export functionality
- [ ] Do final check : npm run lint, npx tsc --noEmit, rm -rf .next, npm cache clean --force and npm run build

## ⚙️ Phase 10: Settings & Configuration

### 10.1 Settings API Development
- [ ] Create settings API endpoints
  - [ ] GET /api/settings (list all settings)
  - [ ] GET /api/settings/[key] (single setting)
  - [ ] PUT /api/settings/[key] (update setting)
  - [ ] POST /api/settings (create new setting)
- [ ] Implement settings validation
- [ ] Set up settings caching
- [ ] Create settings backup/restore
- [ ] Add settings activity logging
- [ ] Do final check : npm run lint, npx tsc --noEmit, rm -rf .next, npm cache clean --force and npm run build

### 10.2 Settings UI Components
- [ ] Create general settings page (/src/app/admin/settings/page.tsx)
  - [ ] Site name and description
  - [ ] Contact information
  - [ ] Social media links
  - [ ] Timezone and language settings
- [ ] Create image processing settings page (/src/app/admin/settings/media/page.tsx)
  - [ ] Max image size slider
  - [ ] Quality percentage slider
  - [ ] WebP conversion toggle
  - [ ] File type restrictions
  - [ ] Storage quota settings
- [ ] Create notification settings page
  - [ ] Email notification preferences
  - [ ] In-app notification settings
  - [ ] Notification templates
- [ ] Create backup settings page
  - [ ] Automated backup schedule
  - [ ] Backup retention policy
  - [ ] Backup encryption settings
- [ ] Do final check : npm run lint, npx tsc --noEmit, rm -rf .next, npm cache clean --force and npm run build

## 🔔 Phase 11: Notification System with Socket.io Integration

### 11.1 Notification System Architecture
- [ ] Create notification tRPC router with CRUD procedures
  - [ ] notifications.getAll (list with pagination, read/unread filter)
  - [ ] notifications.getById (single notification)
  - [ ] notifications.markAsRead (mark as read)
  - [ ] notifications.markAllAsRead (mark all as read)
  - [ ] notifications.delete (delete notification)
- [ ] Implement Socket.io event system for real-time notifications
  - [ ] notification.created (new notification trigger)
  - [ ] notification.read (mark as read trigger)
  - [ ] notification.deleted (delete notification trigger)
- [ ] Set up notification creation system with Socket.io triggers
- [ ] Create notification preferences management with tRPC
- [ ] Implement notification templates with tRPC
- [ ] Add notification delivery tracking with Socket.io
- [ ] Set up notification room management for targeted notifications
- [ ] Create notification queue system for bulk notifications
- [ ] Do final check : npm run lint, npx tsc --noEmit, rm -rf .next, npm cache clean --force and npm run build

### 11.2 Notification UI Components with Real-time Updates
- [ ] Create notification center component with Socket.io integration
- [ ] Implement notification badge with real-time unread count updates
- [ ] Set up notification list with real-time filtering
- [ ] Create notification detail view with instant updates
- [ ] Implement notification actions with real-time feedback
- [ ] Set up notification preferences UI with instant save
- [ ] Create notification templates editor with live preview
- [ ] Implement notification history with real-time updates
- [ ] Add notification sound and visual alerts
- [ ] Create notification settings for different event types
- [ ] Do final check : npm run lint, npx tsc --noEmit, rm -rf .next, npm cache clean --force and npm run build

## 📊 Phase 12: Analytics & Reporting

### 12.1 Analytics API Development
- [ ] Create analytics API endpoints
  - [ ] GET /api/analytics/dashboard (dashboard stats)
  - [ ] GET /api/analytics/posts (posts analytics)
  - [ ] GET /api/analytics/reports (reports analytics)
  - [ ] GET /api/analytics/users (user analytics)
  - [ ] GET /api/analytics/media (media analytics)
- [ ] Implement analytics data collection
- [ ] Set up analytics caching
- [ ] Create analytics export functionality
- [ ] Add analytics scheduling
- [ ] Do final check : npm run lint, npx tsc --noEmit, rm -rf .next, npm cache clean --force and npm run build

### 12.2 Analytics UI Components
- [ ] Create analytics dashboard page (/src/app/admin/analytics/page.tsx)
- [ ] Implement chart components for data visualization
- [ ] Set up date range filtering
- [ ] Create analytics export options
- [ ] Implement real-time analytics
- [ ] Set up analytics comparison tools
- [ ] Create analytics reporting
- [ ] Implement analytics alerts
- [ ] Do final check : npm run lint, npx tsc --noEmit, rm -rf .next, npm cache clean --force and npm run build

## 🔄 Phase 13: Activity Logging & Audit

### 13.1 Activity Logging API
- [ ] Create activity log API endpoints
  - [ ] GET /api/activity-logs (list with pagination, filtering)
  - [ ] GET /api/activity-logs/[id] (single log entry)
  - [ ] POST /api/activity-logs (create log entry)
- [ ] Implement automatic activity logging
- [ ] Set up log filtering and search
- [ ] Create log retention policies
- [ ] Add log export functionality
- [ ] Do final check : npm run lint, npx tsc --noEmit, rm -rf .next, npm cache clean --force and npm run build

### 13.2 Activity Logging UI
- [ ] Create activity logs page (/src/app/admin/activity-logs/page.tsx)
- [ ] Implement log filtering and search
- [ ] Set up log detail view
- [ ] Create log export options
- [ ] Implement log analytics
- [ ] Set up log retention management
- [ ] Create log cleanup utilities
- [ ] Do final check : npm run lint, npx tsc --noEmit, rm -rf .next, npm cache clean --force and npm run build

## 💾 Phase 14: Backup & Restore System

### 14.1 Backup API Development
- [ ] Create backup API endpoints
  - [ ] GET /api/backups (list of backups)
  - [ ] POST /api/backups/create (create new backup)
  - [ ] POST /api/backups/[id]/restore (restore from backup)
  - [ ] DELETE /api/backups/[id] (delete backup)
  - [ ] GET /api/backups/[id]/download (download backup)
- [ ] Implement automated backup scheduling
- [ ] Set up backup encryption
- [ ] Create backup verification
- [ ] Add backup activity logging
- [ ] Do final check : npm run lint, npx tsc --noEmit, rm -rf .next, npm cache clean --force and npm run build

### 14.2 Backup UI Components
- [ ] Create backup management page (/src/app/admin/backups/page.tsx)
- [ ] Implement backup creation interface
- [ ] Set up backup restore functionality
- [ ] Create backup download options
- [ ] Implement backup scheduling
- [ ] Set up backup encryption settings
- [ ] Create backup verification tools
- [ ] Implement backup analytics
- [ ] Do final check : npm run lint, npx tsc --noEmit, rm -rf .next, npm cache clean --force and npm run build

## 🧪 Phase 15: Testing & Quality Assurance

### 15.1 Unit Testing
- [ ] Set up Jest testing framework
- [ ] Create unit tests for API endpoints
- [ ] Implement component testing with React Testing Library
- [ ] Create utility function tests
- [ ] Set up test coverage reporting
- [ ] Implement automated testing in CI/CD
- [ ] Create test data fixtures

### 15.2 Integration Testing
- [ ] Create API integration tests
- [ ] Implement database testing
- [ ] Set up end-to-end testing with Playwright
- [ ] Create user flow testing
- [ ] Implement performance testing
- [ ] Set up security testing
- [ ] Create accessibility testing

### 15.3 Quality Assurance
- [ ] Set up code review process
- [ ] Implement automated code quality checks
- [ ] Create documentation standards
- [ ] Set up deployment testing
- [ ] Implement user acceptance testing
- [ ] Create bug tracking system
- [ ] Set up release management

---

## 🎯 Priority Levels for Admin Dashboard

### 🔴 Phase 1-3: Foundation (Critical - Week 1-2)
- Project setup and database configuration
- Authentication and authorization system
- Admin dashboard layout and navigation

### 🔴 Phase 4-6: Core Content Management (Critical - Week 3-4)
- Posts management system
- Pages management system
- Media management system

### 🟡 Phase 7-9: Reporting & User Management (High - Week 5-6)
- Reporting system
- Categories and tags management
- User management system

### 🟡 Phase 10-12: Settings & Analytics (Medium - Week 7)
- Settings and configuration
- Notification system
- Analytics and reporting

### 🟢 Phase 13-15: Advanced Features (Low - Week 8)
- Activity logging and audit
- Backup and restore system
- Testing and quality assurance

---

## 📅 Admin Dashboard Development Timeline

### Week 1-2: Foundation Setup
- Project initialization and configuration
- Database setup and seeding
- Authentication system implementation
- Basic admin dashboard layout

### Week 3-4: Core Content Management
- Posts CRUD operations and UI
- Pages management with TinaCMS
- Media upload and management system

### Week 5-6: Advanced Features
- Reporting system with dynamic statuses
- Categories and tags management
- User management and role assignment

### Week 7: Configuration & Analytics
- Settings and configuration pages
- Notification system
- Basic analytics dashboard

### Week 8: Testing & Polish
- Activity logging
- Backup system
- Testing and quality assurance

---

## 📋 Admin Dashboard Feature Checklist

### Authentication & Security
- [ ] Google OAuth login
- [ ] Email/password registration
- [ ] Role-based access control
- [ ] Session management
- [ ] Protected routes

### Dashboard Overview
- [ ] Statistics cards
- [ ] Recent activity feed
- [ ] Quick actions
- [ ] Notifications center
- [ ] Search functionality

### Content Management
- [ ] Posts CRUD with CKEditor
- [ ] Pages CRUD with TinaCMS
- [ ] Categories management
- [ ] Tags management
- [ ] Media library with upload

### Reporting System
- [ ] Report creation and management
- [ ] Dynamic status system
- [ ] Location-based reporting
- [ ] File attachments
- [ ] Response system

### User Management
- [ ] User list and search
- [ ] Role assignment
- [ ] User activity tracking
- [ ] Profile management

### Settings & Configuration
- [ ] General settings
- [ ] Image processing settings
- [ ] Notification preferences
- [ ] Backup configuration

### Advanced Features
- [ ] Activity logging
- [ ] Analytics dashboard
- [ ] Backup and restore
- [ ] Export functionality

---

## 🛠️ Technical Implementation Notes

### Component Structure
- Use shadcn/ui components for consistent UI
- Implement proper TypeScript types
- Use react-hook-form for form management
- Implement proper error handling
- Use loading states for better UX

### API Design
- **tRPC Architecture**: End-to-end type safety with shared Zod schemas
- **Data Flow**: Client → tRPC → Zod Validation → Prisma → SQLite → superjson serialization
- **Real-time**: Socket.io for instant notifications and live updates
- **Input Validation**: Zod schemas shared between client and server
- **Error Handling**: Structured error responses with proper logging
- **Security**: Rate limiting, input sanitization, authentication checks

### Database Design
- Soft delete implementation
- Proper indexing for performance
- Relationship integrity
- Audit trail implementation
- Data validation at database level

### Security Considerations
- Input sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Proper authentication checks

### Performance Optimization
- Database query optimization
- Image optimization
- Caching strategies
- Lazy loading
- Code splitting

---

## 📝 Development Guidelines

### Code Quality
- Follow TypeScript best practices
- Use ESLint and Prettier
- Write meaningful comments
- Create reusable components
- Implement proper error handling

### Testing Strategy
- Unit tests for utilities
- Integration tests for APIs
- Component tests for UI
- E2E tests for user flows
- Performance testing

### Documentation
- API documentation
- Component documentation
- Database schema documentation
- User guide documentation
- Deployment documentation

---

## Example Code (ES6 + Documentation)

/**
 * ChatService class handles real-time chat operations
 * using Socket.io.
 *
 * @class ChatService
 * @example
 * const chat = new ChatService(io);
 * chat.sendMessage('user123', 'Hello World!');
 */
class ChatService {
  /**
   * Create a new ChatService.
   * @param {Object} io - The Socket.io server instance.
   */
  constructor(io) {
    this.io = io;
  }

  /**
   * Send a message to a specific user.
   *
   * @param {string} userId - The unique ID of the recipient user.
   * @param {string} message - The message content.
   * @returns {void}
   */
  sendMessage(userId, message) {
    this.io.to(userId).emit('chat_message', {
      userId,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Broadcast a message to all connected users.
   *
   * @param {string} message - The message to broadcast.
   * @returns {void}
   */
  broadcastMessage(message) {
    this.io.emit('chat_message', {
      userId: 'system',
      message,
      timestamp: new Date().toISOString(),
    });
  }
}

// Example usage
// const io = require("socket.io")(3000);
// const chat = new ChatService(io);
// chat.broadcastMessage("Welcome to the chat!");

---

## Guidelines
1. Always follow **ES6 standards** (`let/const`, arrow functions, async/await, destructuring).
2. Use **JSDoc-style comments** for functions, classes, and modules.
3. Keep the **TODO list updated** because user can get Limit any time:
  - 🔄 = for active tasks
  - ✅ = Done / when finished
  - ❌ = Failed / Error / Need to fix it
4. Create an INDEX file for Phase [Major].[Minor] with the following details: 
   Example:
    ```
    for Phase 1.2 = INDEX-1-2.md
    for Phase 2.3 = INDEX-2-3.md

    The file should include:
    **1. List of New/Modified Files & Folders:
    *(List all file and folder paths that were added or modified in this phase. use tree structure format) 
    src/
    ├── app/
    │   ├── admin/
    │   │   ├── posts/
    │   │   │   └── page.tsx           # Main posts management interface
    │   │   └── layout.tsx             # Admin layout
    │   ├── globals.css                # Global styles
    │   ├── layout.tsx                 # Root layout
    │   └── page.tsx                   # Homepage
    ├── components/
    --- and the rest ---

    **2. Component Functions & Features:**
    *(For each important file (component, hook, API, utility), explain its function and features. Use the format below for each file.)*

    **For Components:**
    - **File:** `src/components/posts/PostCard.tsx`
    - **Function:** Displays article preview with quick actions.
    - **Features:**
    - Shows title, excerpt, author, date, status.
    - Quick edit, delete, publish actions.
    - Responsive design with hover effects.
    - Category and tag badges.

    - **File:** `src/components/posts/PostForm.tsx`
    - **Function:** Form for creating and editing posts.
    - **Features:**
    - Inputs for title, slug, content (rich text editor), and category.
    - Client-side form validation.
    - Real-time content preview.
    - Handles draft and publish status.

    **For API/Routes:**
    - **File:** `src/app/api/posts/route.ts`
    - **Function:** API endpoint for post CRUD operations.
    - **Features:**
    - `GET`: Fetches all posts, supports `search` and `status` queries.
    - `POST`: Creates a new post.
    - `PUT`: Updates a post by ID.
    - `DELETE`: Permanently deletes a post.

    **For Utilities/Hooks/Types:**
    - **File:** `src/lib/posts.ts`
    - **Function:** Utility functions for interacting with the posts database.
    - **Features:**
    - `getPosts()`: Retrieves post data from the database.
    - `createPost()`: Saves a new post.
    - `updatePost()`: Updates post data.
    - `deletePost()`: Deletes a post entry.

    - **File:** `src/types/post.ts`
    - **Function:** Defines TypeScript types for posts.
    - **Features:**
    - Exports `Post`, `PostStatus`, `PostCategory` types.

    **3. Configuration & Dependencies:**
    *(Mention any new dependencies or other configuration changes.)*
    - Added `react-hook-form` library for form management.
    - Added `@tinymce/tinymce-react` for the rich text editor.
    - Updated `prisma/schema.prisma` with the `Post` model.

    **4. Other Important Notes:**
    *(Additional notes as reminders for the future.)*
    - Pagination implementation for the post listing page is planned for the next phase.
    - The admin page access is not yet protected by authentication.
    ```