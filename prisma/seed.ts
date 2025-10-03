import { PrismaClient } from '@prisma/client'
import { UserRole, PostType, PostStatus, NotificationType, ActivityType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create default statuses for reports
  const defaultStatuses = [
    { name: 'Baru', description: 'Laporan baru masuk', color: '#007bff', order: 1 },
    { name: 'Diproses', description: 'Sedang dalam proses', color: '#ffc107', order: 2 },
    { name: 'Ditunda', description: 'Laporan ditunda sementara', color: '#fd7e14', order: 3 },
    { name: 'Selesai', description: 'Laporan telah selesai', color: '#28a745', order: 4 },
  ]

  for (const status of defaultStatuses) {
    await prisma.status.upsert({
      where: { name: status.name },
      update: status,
      create: status,
    })
  }

  // Create default categories
  const defaultCategories = [
    { name: 'Teknologi', slug: 'teknologi', type: PostType.POST, description: 'Artikel tentang teknologi' },
    { name: 'Bisnis', slug: 'bisnis', type: PostType.POST, description: 'Artikel tentang bisnis' },
    { name: 'Pendidikan', slug: 'pendidikan', type: PostType.POST, description: 'Artikel tentang pendidikan' },
    { name: 'Kesehatan', slug: 'kesehatan', type: PostType.POST, description: 'Artikel tentang kesehatan' },
    { name: 'Halaman Statis', slug: 'halaman-statis', type: PostType.PAGE, description: 'Halaman statis website' },
  ]

  for (const category of defaultCategories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    })
  }

  // Create default tags
  const defaultTags = [
    { name: 'JavaScript', slug: 'javascript' },
    { name: 'React', slug: 'react' },
    { name: 'Next.js', slug: 'nextjs' },
    { name: 'TypeScript', slug: 'typescript' },
    { name: 'Web Development', slug: 'web-development' },
    { name: 'Database', slug: 'database' },
    { name: 'UI/UX', slug: 'ui-ux' },
    { name: 'Mobile', slug: 'mobile' },
  ]

  for (const tag of defaultTags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: tag,
      create: tag,
    })
  }

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      role: UserRole.ADMIN,
    },
  })

  // Create default settings
  const defaultSettings = [
    { key: 'site_title', value: 'Blog Admin Dashboard', description: 'Website title', type: 'string', category: 'general' },
    { key: 'site_description', value: 'Modern blog with admin dashboard', description: 'Website description', type: 'string', category: 'general' },
    { key: 'posts_per_page', value: '10', description: 'Number of posts per page', type: 'number', category: 'display' },
    { key: 'enable_comments', value: 'true', description: 'Enable comments on posts', type: 'boolean', category: 'features' },
    { key: 'max_upload_size', value: '52428800', description: 'Maximum upload size in bytes', type: 'number', category: 'media' },
    { key: 'allowed_image_types', value: '["jpg", "jpeg", "png", "gif", "webp"]', description: 'Allowed image file types', type: 'json', category: 'media' },
    { key: 'allowed_document_types', value: '["pdf", "doc", "docx", "xls", "xlsx"]', description: 'Allowed document file types', type: 'json', category: 'media' },
  ]

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: setting,
      create: setting,
    })
  }

  // Create sample posts
  const samplePosts = [
    {
      title: 'Getting Started with Web Development',
      slug: 'getting-started-web-development',
      content: '# Getting Started with Web Development\n\nWeb development is an exciting field that combines creativity with technical skills. In this article, we\'ll explore the fundamentals of web development and how you can get started on your journey.',
      excerpt: 'Learn the basics of web development and start your journey as a developer.',
      categoryId: (await prisma.category.findFirst({ where: { slug: 'teknologi' } }))?.id,
      status: PostStatus.PUBLISHED,
      authorId: adminUser.id,
      publishedAt: new Date(),
    },
    {
      title: 'Advanced CSS Techniques',
      slug: 'advanced-css-techniques',
      content: '# Advanced CSS Techniques\n\nCSS has evolved significantly over the years. In this comprehensive guide, we\'ll explore advanced CSS techniques that will take your styling skills to the next level.',
      excerpt: 'Master advanced CSS techniques and create stunning web designs.',
      categoryId: (await prisma.category.findFirst({ where: { slug: 'teknologi' } }))?.id,
      status: PostStatus.PUBLISHED,
      authorId: adminUser.id,
      publishedAt: new Date(),
    },
    {
      title: 'JavaScript Best Practices',
      slug: 'javascript-best-practices',
      content: '# JavaScript Best Practices\n\nWriting clean, maintainable JavaScript code is essential for any developer. This article covers the best practices you should follow in your JavaScript projects.',
      excerpt: 'Learn JavaScript best practices for writing clean and maintainable code.',
      categoryId: (await prisma.category.findFirst({ where: { slug: 'teknologi' } }))?.id,
      status: PostStatus.DRAFT,
      authorId: adminUser.id,
    },
  ]

  for (const postData of samplePosts) {
    // Handle undefined categoryId by converting to null
    const processedPostData = {
      ...postData,
      categoryId: postData.categoryId || null,
    }
    
    const post = await prisma.post.upsert({
      where: { slug: postData.slug },
      update: processedPostData,
      create: processedPostData,
    })

    // Add some tags to posts
    if (post.slug === 'getting-started-web-development') {
      const javascriptTag = await prisma.tag.findFirst({ where: { slug: 'javascript' } })
      const webDevTag = await prisma.tag.findFirst({ where: { slug: 'web-development' } })
      
      if (javascriptTag) {
        await prisma.postTag.upsert({
          where: { postId_tagId: { postId: post.id, tagId: javascriptTag.id } },
          update: {},
          create: { postId: post.id, tagId: javascriptTag.id },
        })
      }
      
      if (webDevTag) {
        await prisma.postTag.upsert({
          where: { postId_tagId: { postId: post.id, tagId: webDevTag.id } },
          update: {},
          create: { postId: post.id, tagId: webDevTag.id },
        })
      }
    }
  }

  // Create sample reports
  const sampleReports = [
    {
      title: 'Laporan Masalah Jalan Rusak',
      description: 'Jalan di depan kantor rusak parah, banyak lubang yang membahayakan pengendara.',
      location: 'Jl. Sudirman No. 123',
      lat: -6.2088,
      lng: 106.8456,
      statusId: (await prisma.status.findFirst({ where: { name: 'Baru' } }))?.id,
      authorId: adminUser.id,
    },
    {
      title: 'Laporan Pohon Tumbang',
      description: 'Pohon besar di taman kota tumbang menutupi jalan akibat hujan deras.',
      location: 'Taman Kota',
      lat: -6.1751,
      lng: 106.8650,
      statusId: (await prisma.status.findFirst({ where: { name: 'Diproses' } }))?.id,
      authorId: adminUser.id,
    },
  ]

  for (const reportData of sampleReports) {
    // Ensure statusId exists, fallback to first status if not found
    let statusId = reportData.statusId
    if (!statusId) {
      const firstStatus = await prisma.status.findFirst()
      statusId = firstStatus?.id || (await prisma.status.create({
        data: { name: 'Default', description: 'Default status', color: '#6c757d', order: 0 }
      })).id
    }
    
    await prisma.report.create({
      data: {
        ...reportData,
        statusId: statusId,
      },
    })
  }

  // Create sample notifications
  const sampleNotifications = [
    {
      title: 'Selamat Datang',
      message: 'Selamat datang di Blog Admin Dashboard!',
      type: NotificationType.INFO,
      userId: adminUser.id,
    },
    {
      title: 'Laporan Baru',
      message: 'Ada laporan baru yang perlu ditinjau.',
      type: NotificationType.WARNING,
      userId: adminUser.id,
    },
  ]

  for (const notificationData of sampleNotifications) {
    await prisma.notification.create({
      data: notificationData,
    })
  }

  // Create sample activity logs
  const sampleActivities = [
    {
      type: ActivityType.CREATE,
      action: 'create_user',
      description: 'Admin user created',
      userId: adminUser.id,
    },
    {
      type: ActivityType.LOGIN,
      action: 'user_login',
      description: 'Admin user logged in',
      userId: adminUser.id,
    },
  ]

  for (const activityData of sampleActivities) {
    await prisma.activityLog.create({
      data: activityData,
    })
  }

  console.log('✅ Database seeded successfully!')
  console.log('📊 Summary:')
  console.log(`   - Users: ${await prisma.user.count()}`)
  console.log(`   - Categories: ${await prisma.category.count()}`)
  console.log(`   - Tags: ${await prisma.tag.count()}`)
  console.log(`   - Posts: ${await prisma.post.count()}`)
  console.log(`   - Reports: ${await prisma.report.count()}`)
  console.log(`   - Statuses: ${await prisma.status.count()}`)
  console.log(`   - Settings: ${await prisma.setting.count()}`)
  console.log(`   - Notifications: ${await prisma.notification.count()}`)
  console.log(`   - Activities: ${await prisma.activityLog.count()}`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })