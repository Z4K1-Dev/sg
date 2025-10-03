import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Test database connection
    await db.$queryRaw`SELECT 1 as test`;
    
    // Get database stats
    const [
      userCount,
      postCount,
      categoryCount,
      tagCount,
      reportCount,
      statusCount
    ] = await Promise.all([
      db.user.count(),
      db.post.count(),
      db.category.count(),
      db.tag.count(),
      db.report.count(),
      db.status.count(),
    ]);

    return NextResponse.json({
      status: "healthy",
      database: "connected",
      stats: {
        users: userCount,
        posts: postCount,
        categories: categoryCount,
        tags: tagCount,
        reports: reportCount,
        statuses: statusCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      { 
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}