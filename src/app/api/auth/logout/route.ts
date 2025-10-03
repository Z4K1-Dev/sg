export async function POST() {
  try {
    // NextAuth handles logout server-side through its session mechanisms
    // For API-based logout, this endpoint could invalidate server-side sessions if needed
    // For now, we'll just return a success response
    return new Response(
      JSON.stringify({ message: "Logged out successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error during logout:", error);
    return new Response(
      JSON.stringify({ error: "Failed to logout" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}