// Define the User type based on the Prisma schema
// Using the actual types from the Prisma client
export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'USER' | 'OPERATOR' | 'ADMIN'; // This corresponds to the UserRole enum in Prisma
  avatar: string | null;
  bio: string | null;
  password: string | null;
  passwordResetToken: string | null;
  passwordResetExpires: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// Define the Session type
export interface Session {
  user?: {
    id: string;
    email?: string;
    name?: string;
    role?: 'USER' | 'OPERATOR' | 'ADMIN';
    avatar?: string;
    bio?: string;
  };
  expires: string;
}

// Define the ActivityLog type
export interface ActivityLog {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT'; // This corresponds to the ActivityType enum in Prisma
  action: string;
  description: string;
  userId: string | null;
  entityId: string | null;
  entityType: string | null;
  metadata: string | null; // JSON string
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}