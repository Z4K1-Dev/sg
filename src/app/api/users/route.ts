import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/users - Get list of users with pagination and filtering
export async function GET(request: Request) {
  try {
    const session = await auth();
    
    // Only admins can view all users
    if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
      return new Response(
        JSON.stringify({ error: "Forbidden" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: any = { deletedAt: null }; // Exclude soft deleted users
    if (role) whereClause.role = role;
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Fetch users with pagination and filters
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        bio: true,
        createdAt: true,
        updatedAt: true
      },
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    // Fetch total count for pagination
    const totalCount = await prisma.user.count({ where: whereClause });

    return new Response(
      JSON.stringify({ 
        users, 
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch users" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT /api/users/[id] - Update user details (admin only)
export async function PUT(request: Request) {
  try {
    const session = await auth();
    
    // Only admins can update user details
    if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
      return new Response(
        JSON.stringify({ error: "Forbidden" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Extract user ID from URL
    const { pathname } = new URL(request.url);
    const userId = pathname.split('/').pop(); // Get the last part of the URL

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await request.json();
    const { name, email, role, bio, avatar } = body;

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || undefined,
        email: email || undefined,
        role: role || undefined, // Only admins can change roles
        bio: bio || undefined,
        avatar: avatar || undefined,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        bio: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return new Response(
      JSON.stringify({ user: updatedUser }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update user" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/users/[id] - Soft delete user (admin only)
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    
    // Only admins can delete users
    if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
      return new Response(
        JSON.stringify({ error: "Forbidden" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Extract user ID from URL
    const { pathname } = new URL(request.url);
    const userId = pathname.split('/').pop(); // Get the last part of the URL

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Prevent admin from deleting themselves
    if (session.user.id === userId) {
      return new Response(
        JSON.stringify({ error: "Cannot delete your own account" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Soft delete user by setting deletedAt
    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });

    return new Response(
      JSON.stringify({ message: "User deleted successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete user" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    await prisma.$disconnect();
  }
}