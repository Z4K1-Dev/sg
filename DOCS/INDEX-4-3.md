### USER
buat file INDEX.md, isi dengan informasi indexing file dan apa fungsinya, dan informasi penting lainya untuk jadi pengingat anda dimasa depan

### ASSISTANT
I'll create an INDEX.md file with comprehensive information about the project structure, file indexing, and important reminders for future development.

# Blog Management System - Project Index

## 📋 Project Overview

This is a comprehensive Next.js 14 + TypeScript blog management system with tRPC backend, Prisma ORM, and modern UI components using shadcn/ui and CKEditor 5.

## 🗂️ File Structure & Indexing

### Core Application Files
```
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
│   ├── ui/                        # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── textarea.tsx
│   │   ├── select.tsx
│   │   ├── checkbox.tsx
│   │   ├── toast.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── badge.tsx
│   │   ├── separator.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── alert.tsx
│   │   ├── loading-spinner.tsx
│   │   ├── pagination.tsx
│   │   └── index.ts               # UI components export
│   └── posts/                     # Posts-specific components
│       ├── PostCard.tsx           # Article preview card
│       ├── PostList.tsx           # Posts list with pagination
│       ├── PostForm.tsx           # Create/edit form with CKEditor
│       ├── PostDetail.tsx         # Post detail view
│       ├── CategoryManager.tsx    # Category management
│       ├── TagManager.tsx         # Tag management
│       ├── PostSearch.tsx         # Advanced search
│       ├── PostActions.tsx        # Bulk operations
│       └── PostStatusManager.tsx  # Status dashboard
├── lib/
│   ├── db.ts                      # Prisma database client
│   ├── trpc.ts                    # tRPC configuration
│   ├── utils.ts                   # Utility functions
│   └── validations.ts             # Form validations
├── server/
│   └── routers/
│       └── posts.ts               # Posts API routes
└── types/
    └── posts.ts                   # TypeScript interfaces
```

### Configuration Files
```
├── prisma/
│   └── schema.prisma              # Database schema
├── public/
│   └── uploads/                   # File uploads directory
├── next.config.js                 # Next.js configuration
├── tailwind.config.js             # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript configuration
├── package.json                   # Dependencies and scripts
└── components.json                # shadcn/ui configuration
```

## 🎯 Component Functions & Features

### Core Posts Components

#### 1. PostCard (`src/components/posts/PostCard.tsx`)
**Function**: Displays article preview with quick actions
- Shows title, excerpt, author, date, status
- Quick edit, delete, publish actions
- Responsive design with hover effects
- Category and tag badges

#### 2. PostList (`src/components/posts/PostList.tsx`)
**Function**: Main posts listing with pagination and filtering
- Paginated posts display
- Search and filter capabilities
- Bulk selection for operations
- Sorting options
- Empty state handling

#### 3. PostForm (`src/components/posts/PostForm.tsx`)
**Function**: Complete create/edit form with rich text editor
- CKEditor 5 integration
- SEO meta fields
- Category and tag selection
- Image upload support
- Form validation
- Auto-save functionality

#### 4. PostDetail (`src/components/posts/PostDetail.tsx`)
**Function**: Detailed post view with edit capabilities
- Full content display
- Metadata information
- Related posts suggestions
- Social sharing options
- Comment system integration

#### 5. CategoryManager (`src/components/posts/CategoryManager.tsx`)
**Function**: Category CRUD operations
- Create, edit, delete categories
- Category hierarchy support
- Post count per category
- Color coding system

#### 6. TagManager (`src/components/posts/TagManager.tsx`)
**Function**: Tag management system
- Tag creation and editing
- Tag usage statistics
- Popular tags highlighting
- Bulk tag operations

#### 7. PostSearch (`src/components/posts/PostSearch.tsx`)
**Function**: Advanced search functionality
- Full-text search
- Filter by date, status, author
- Saved search presets
- Search history

#### 8. PostActions (`src/components/posts/PostActions.tsx`)
**Function**: Bulk operations on posts
- Multi-select functionality
- Bulk publish/unpublish
- Bulk archive/delete
- Export selected posts

#### 9. PostStatusManager (`src/components/posts/PostStatusManager.tsx`)
**Function**: Status management dashboard
- Status overview statistics
- Quick status changes
- Workflow management
- Status history tracking

### UI Components (`src/components/ui/`)

#### Essential shadcn/ui Components
- **Button**: Consistent button styling with variants
- **Card**: Container components with proper spacing
- **Input**: Form inputs with validation states
- **Dialog**: Modal dialogs for forms and confirmations
- **Table**: Data tables with sorting and pagination
- **Toast**: Notification system for user feedback
- **Select**: Dropdown selects with search
- **Checkbox**: Form checkboxes with proper styling
- **Badge**: Status indicators and tags
- **Tabs**: Tab navigation for content organization

## 🔧 Technical Implementation Details

### Database Schema (Prisma)
```prisma
model Post {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  content     String
  excerpt     String?
  coverImage  String?
  published   Boolean  @default(false)
  authorId    String
  categoryId  String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  author      User     @relation(fields: [authorId], references: [id])
  category    Category? @relation(fields: [categoryId], references: [id])
  tags        PostTag[]
}

model Category {
  id          String   @id @default(cuid())
  name        String   @unique
  slug        String   @unique
  description String?
  color       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  posts       Post[]
}

model Tag {
  id      String    @id @default(cuid())
  name    String    @unique
  slug    String    @unique
  color   String?
  posts   PostTag[]
}

model PostTag {
  postId String
  tagId  String
  
  post   Post @relation(fields: [postId], references: [id])
  tag    Tag  @relation(fields: [tagId], references: [id])
  
  @@id([postId, tagId])
}
```

### tRPC API Structure
```typescript
// Posts router procedures
posts: {
  // Queries
  getAll: (input: GetPostsInput) => Post[]
  getById: (input: { id: string }) => Post
  getBySlug: (input: { slug: string }) => Post
  search: (input: SearchInput) => Post[]
  
  // Mutations
  create: (input: CreatePostInput) => Post
  update: (input: UpdatePostInput) => Post
  delete: (input: { id: string }) => void
  publish: (input: { id: string }) => Post
  unpublish: (input: { id: string }) => Post
  
  // Category operations
  createCategory: (input: CreateCategoryInput) => Category
  updateCategory: (input: UpdateCategoryInput) => Category
  deleteCategory: (input: { id: string }) => void
  
  // Tag operations
  createTag: (input: CreateTagInput) => Tag
  updateTag: (input: UpdateTagInput) => Tag
  deleteTag: (input: { id: string }) => void
}
```

## 🎨 Styling & Design System

### Tailwind CSS Configuration
- **Primary Colors**: slate-900, slate-700, slate-600
- **Accent Colors**: blue-600, blue-500
- **Background Colors**: white, slate-50, slate-100
- **Text Colors**: slate-900, slate-700, slate-600, slate-500
- **Border Colors**: slate-200, slate-300

### Component Styling Patterns
- **Cards**: `bg-white rounded-lg border border-slate-200 shadow-sm`
- **Buttons**: `inline-flex items-center justify-center rounded-md text-sm font-medium`
- **Inputs**: `flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2`
- **Spacing**: Consistent use of `p-4`, `p-6`, `gap-4`, `gap-6`

## 🚀 Development Guidelines

### Code Standards
1. **TypeScript**: Strict typing for all components and functions
2. **Component Structure**: Functional components with hooks
3. **File Naming**: PascalCase for components, camelCase for utilities
4. **Imports**: Absolute imports with `@/` prefix
5. **Error Handling**: Proper error boundaries and user feedback

### Performance Considerations
1. **Image Optimization**: Next.js Image component for all images
2. **Code Splitting**: Dynamic imports for heavy components
3. **Database Queries**: Optimized Prisma queries with proper selects
4. **Caching**: React Query for client-side caching
5. **Bundle Size**: Tree shaking and proper imports

### SEO Best Practices
1. **Meta Tags**: Dynamic meta titles and descriptions
2. **Structured Data**: JSON-LD for articles and breadcrumbs
3. **URL Structure**: Clean, semantic URLs with slugs
4. **Image Alt Text**: Descriptive alt text for all images
5. **Internal Linking**: Related posts and category links

## 🔐 Security Considerations

### Authentication & Authorization
1. **Session Management**: Secure session handling
2. **Role-Based Access**: Admin, editor, author roles
3. **API Protection**: tRPC procedures with middleware
4. **CSRF Protection**: Built-in Next.js CSRF protection
5. **Input Validation**: Zod schemas for all inputs

### Data Protection
1. **SQL Injection**: Prisma ORM protection
2. **XSS Protection**: Content sanitization
3. **File Uploads**: Secure file handling and validation
4. **Rate Limiting**: API rate limiting
5. **Environment Variables**: Secure configuration management

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (md, lg)
- **Desktop**: > 1024px (xl, 2xl)

### Mobile-First Approach
1. **Navigation**: Collapsible sidebar for mobile
2. **Tables**: Horizontal scroll on mobile
3. **Forms**: Stacked layout on mobile
4. **Images**: Responsive sizing with aspect ratio
5. **Touch Targets**: Minimum 44px touch targets

## 🔄 State Management

### Client State
1. **Local State**: useState for component state
2. **Global State**: Zustand for cross-component state
3. **Server State**: React Query for API data
4. **Form State**: React Hook Form for form management

### Data Flow
1. **Components** → **tRPC Queries** → **Prisma** → **Database**
2. **User Actions** → **tRPC Mutations** → **Database Updates** → **UI Updates**

## 🧪 Testing Strategy

### Component Testing
1. **Unit Tests**: Jest + React Testing Library
2. **Integration Tests**: Component interaction testing
3. **E2E Tests**: Playwright for critical user flows
4. **Visual Testing**: Chromatic for UI consistency

### API Testing
1. **tRPC Tests**: Procedure testing with test database
2. **Database Tests**: Prisma client testing
3. **Validation Tests**: Zod schema validation testing

## 📊 Monitoring & Analytics

### Performance Monitoring
1. **Web Vitals**: Core Web Vitals tracking
2. **Error Tracking**: Sentry integration
3. **Performance**: Bundle analysis and optimization
4. **Database**: Query performance monitoring

### User Analytics
1. **Page Views**: Post and page tracking
2. **User Behavior**: Interaction tracking
3. **Search Analytics**: Search term analysis
4. **Content Performance**: Popular posts and categories

## 🚀 Deployment

### Build Process
1. **Development**: `npm run dev` with Turbopack
2. **Production**: `npm run build` with optimization
3. **Linting**: `npm run lint` for code quality
4. **Type Checking**: `npm run type-check` for TypeScript

### Environment Setup
1. **Development**: Local SQLite database
2. **Staging**: PostgreSQL with test data
3. **Production**: PostgreSQL with backups
4. **CDN**: CloudFront for static assets

## 📝 Important Reminders for Future Development

### 🎯 Phase Priorities
1. **Phase 4.1**: ✅ Core architecture setup
2. **Phase 4.2**: ✅ Posts API development
3. **Phase 4.3**: ✅ Posts UI components (COMPLETED)
4. **Phase 4.4**: 🔄 Socket.io real-time features (NEXT)
5. **Phase 4.5**: ⏳ Advanced features (FUTURE)

### 🔧 Technical Debt
1. **Error Boundaries**: Add comprehensive error handling
2. **Loading States**: Implement skeleton loading
3. **Accessibility**: Improve ARIA labels and keyboard navigation
4. **Performance**: Optimize bundle size and database queries
5. **Testing**: Add comprehensive test coverage

### 🚀 Future Enhancements
1. **Real-time Collaboration**: Socket.io for multi-user editing
2. **Advanced Search**: Elasticsearch integration
3. **Media Management**: Advanced file handling and CDN
4. **Analytics Dashboard**: Built-in analytics and reporting
5. **API Documentation**: OpenAPI/Swagger documentation

### 📋 Development Checklist
- [ ] Add comprehensive error boundaries
- [ ] Implement loading skeletons
- [ ] Add dark mode support
- [ ] Improve mobile responsiveness
- [ ] Add keyboard shortcuts
- [ ] Implement undo/redo functionality
- [ ] Add revision history for posts
- [ ] Create backup/restore functionality
- [ ] Add scheduled publishing
- [ ] Implement content templates

### 🔐 Security Checklist
- [ ] Add rate limiting to API endpoints
- [ ] Implement content security policy
- [ ] Add input sanitization for all user inputs
- [ ] Secure file upload handling
- [ ] Add audit logging for admin actions
- [ ] Implement two-factor authentication
- [ ] Add session timeout handling
- [ ] Secure environment variable management

### 📱 Performance Checklist
- [ ] Optimize images with Next.js Image component
- [ ] Implement code splitting for heavy components
- [ ] Add caching headers for static assets
- [ ] Optimize database queries
- [ ] Implement lazy loading for images
- [ ] Add service worker for offline support
- [ ] Optimize bundle size with tree shaking
- [ ] Add performance monitoring

---

## 📞 Quick Reference

### Essential Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run type-check   # TypeScript checking
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Prisma Studio
```

### Key Files to Modify
- `src/app/admin/posts/page.tsx` - Main posts interface
- `src/components/posts/PostForm.tsx` - Form with CKEditor
- `src/server/routers/posts.ts` - API endpoints
- `prisma/schema.prisma` - Database schema
- `src/lib/db.ts` - Database configuration

### Component Patterns
```typescript
// Standard component structure
export default function ComponentName() {
  // State management
  const [state, setState] = useState()
  
  // API calls
  const { data, isLoading, error } = trpc.posts.getAll.useQuery()
  
  // Event handlers
  const handleSubmit = useCallback(() => {
    // Handle submission
  }, [])
  
  return (
    <div className="container mx-auto p-4">
      {/* Component content */}
    </div>
  )
}
```

---

**Last Updated**: Phase 4.3 Completion
**Next Phase**: Phase 4.4 - Socket.io Real-time Features
**Project Status**: 🟢 Active Development