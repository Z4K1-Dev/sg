import { PrismaClient } from "@prisma/client";
import { generatePasswordResetToken, hashToken } from "@/lib/utils";

const prisma = new PrismaClient();

// POST /api/auth/forgot-password - Send password reset email
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return new Response(
        JSON.stringify({ message: "If an account with this email exists, a password reset link has been sent." }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Generate password reset token
    const resetToken = generatePasswordResetToken();
    const hashedToken = hashToken(resetToken);

    // Set token expiration (1 hour)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Save reset token to the user record
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpires: expiresAt,
      },
    });

    // In a real application, send email with reset link here
    // For demo purposes, we'll just return the token
    console.log(`Password reset token for ${email}: ${resetToken}`);

    return new Response(
      JSON.stringify({ message: "If an account with this email exists, a password reset link has been sent." }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in forgot password:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process password reset request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    await prisma.$disconnect();
  }
}