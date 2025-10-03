import { emitNotificationEvent, emitPostEvent, emitReportEvent } from './init';

// Trigger system for real-time notifications
// These functions will be called from tRPC procedures to emit Socket.io events

export const triggerPostCreation = async (post: any, authorId: string) => {
  try {
    await emitPostEvent({
      type: 'post.created',
      data: {
        id: post.id,
        title: post.title,
        status: post.status,
        authorId,
        timestamp: new Date(),
      },
    });

    // Also create a notification for admin users
    await emitNotificationEvent({
      type: 'notification.created',
      data: {
        id: `post-${post.id}`,
        title: 'New Post Created',
        message: `Post "${post.title}" has been created`,
        type: 'INFO',
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('Error triggering post creation event:', error);
  }
};

export const triggerPostUpdate = async (post: any, authorId: string) => {
  try {
    await emitPostEvent({
      type: 'post.updated',
      data: {
        id: post.id,
        title: post.title,
        status: post.status,
        authorId,
        timestamp: new Date(),
      },
    });

    // Create notification if post status changed to published
    if (post.status === 'PUBLISHED') {
      await emitPostEvent({
        type: 'post.published',
        data: {
          id: post.id,
          title: post.title,
          status: post.status,
          authorId,
          timestamp: new Date(),
        },
      });

      await emitNotificationEvent({
        type: 'notification.created',
        data: {
          id: `post-published-${post.id}`,
          title: 'Post Published',
          message: `Post "${post.title}" has been published`,
          type: 'SUCCESS',
          timestamp: new Date(),
        },
      });
    }
  } catch (error) {
    console.error('Error triggering post update event:', error);
  }
};

export const triggerPostDeletion = async (postId: string, postTitle: string, authorId: string) => {
  try {
    await emitPostEvent({
      type: 'post.deleted',
      data: {
        id: postId,
        title: postTitle,
        status: 'DELETED',
        authorId,
        timestamp: new Date(),
      },
    });

    await emitNotificationEvent({
      type: 'notification.created',
      data: {
        id: `post-deleted-${postId}`,
        title: 'Post Deleted',
        message: `Post "${postTitle}" has been deleted`,
        type: 'WARNING',
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('Error triggering post deletion event:', error);
  }
};

export const triggerReportCreation = async (report: any, authorId: string) => {
  try {
    await emitReportEvent({
      type: 'report.created',
      data: {
        id: report.id,
        title: report.title,
        statusId: report.statusId,
        authorId,
        timestamp: new Date(),
      },
    });

    // Create notification for admin users
    await emitNotificationEvent({
      type: 'notification.created',
      data: {
        id: `report-${report.id}`,
        title: 'New Report Created',
        message: `Report "${report.title}" has been created`,
        type: 'INFO',
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('Error triggering report creation event:', error);
  }
};

export const triggerReportStatusChange = async (report: any, oldStatus: string, newStatus: string) => {
  try {
    await emitReportEvent({
      type: 'report.status_changed',
      data: {
        id: report.id,
        title: report.title,
        statusId: report.statusId,
        authorId: report.authorId,
        timestamp: new Date(),
      },
    });

    // Create notification for the report author
    await emitNotificationEvent({
      type: 'notification.created',
      data: {
        id: `report-status-${report.id}`,
        title: 'Report Status Updated',
        message: `Your report "${report.title}" status changed from ${oldStatus} to ${newStatus}`,
        type: 'INFO',
        userId: report.authorId,
        timestamp: new Date(),
      },
    });

    // Also create notification for admin users
    await emitNotificationEvent({
      type: 'notification.created',
      data: {
        id: `report-status-admin-${report.id}`,
        title: 'Report Status Updated',
        message: `Report "${report.title}" status changed to ${newStatus}`,
        type: 'INFO',
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('Error triggering report status change event:', error);
  }
};

export const triggerNotificationCreation = async (notification: any) => {
  try {
    await emitNotificationEvent({
      type: 'notification.created',
      data: {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        userId: notification.userId,
        timestamp: notification.createdAt,
      },
    });
  } catch (error) {
    console.error('Error triggering notification creation event:', error);
  }
};

// Bulk action triggers
export const triggerBulkPostAction = async (action: string, postIds: string[], _userId: string) => {
  try {
    let eventType: string;
    let notificationTitle: string;
    let notificationMessage: string;

    switch (action) {
      case 'publish':
        eventType = 'post.published';
        notificationTitle = 'Posts Published';
        notificationMessage = `${postIds.length} posts have been published`;
        break;
      case 'unpublish':
        eventType = 'post.unpublished';
        notificationTitle = 'Posts Unpublished';
        notificationMessage = `${postIds.length} posts have been unpublished`;
        break;
      case 'archive':
        eventType = 'post.archived';
        notificationTitle = 'Posts Archived';
        notificationMessage = `${postIds.length} posts have been archived`;
        break;
      case 'delete':
        eventType = 'post.deleted';
        notificationTitle = 'Posts Deleted';
        notificationMessage = `${postIds.length} posts have been deleted`;
        break;
      default:
        return;
    }

    // Emit event to all admin users
    if ((global as any).io) {
      (global as any).io.to('admins').emit('post', {
        type: eventType,
        data: {
          postIds,
          action,
          timestamp: new Date(),
        },
      });
    }

    // Create notification
    await emitNotificationEvent({
      type: 'notification.created',
      data: {
        id: `bulk-${action}-${Date.now()}`,
        title: notificationTitle,
        message: notificationMessage,
        type: 'INFO',
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('Error triggering bulk post action event:', error);
  }
};