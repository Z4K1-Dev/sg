import { PrismaClient } from "@prisma/client";
import { hashPassword, hashToken } from "@/lib/utils";

const prisma = new PrismaClient();

// POST /api/auth/reset-password - Reset password with token
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return new Response(
        JSON.stringify({ error: "Token and new password are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (newPassword.length < 6) {
      return new Response(
        JSON.stringify({ error: "Password must be at least 6 characters" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Hash the provided token to compare with stored token
    const hashedToken = hashToken(token);

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: {
          gte: new Date(), // Token must not be expired
        },
      },
    });

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired reset token" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user with new password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return new Response(
      JSON.stringify({ message: "Password reset successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in reset password:", error);
    return new Response(
      JSON.stringify({ error: "Failed to reset password" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    await prisma.$disconnect();
  }
}