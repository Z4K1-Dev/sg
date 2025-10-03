import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { uploadFile, isValidFileType } from "@/lib/file-upload";
import path from 'path';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get('avatar') as File | null;

    if (!file) {
      return new Response(
        JSON.stringify({ error: "No file uploaded" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Validate file type
    if (!isValidFileType(file.type)) {
      return new Response(
        JSON.stringify({ error: "Invalid file type. Only image files are allowed." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate file size (max 5MB)
    if (buffer.length > 5 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: "File too large. Maximum size is 5MB." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Define upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
    
    // Upload the file
    const uploadResult = await uploadFile(
      buffer,
      file.name,
      uploadDir
    );

    // Update user's avatar in database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id as string },
      data: {
        avatar: `/uploads/avatars/${uploadResult.filename}`,
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
      JSON.stringify({ 
        message: "Avatar uploaded successfully", 
        user: updatedUser,
        avatarPath: uploadResult.path 
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return new Response(
      JSON.stringify({ error: "Failed to upload avatar" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    await prisma.$disconnect();
  }
}