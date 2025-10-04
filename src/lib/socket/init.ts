import { Server as NetServer } from 'http';
import { Server as ServerIO } from 'socket.io';
import { z } from 'zod';

// Socket.io event schemas with Zod validation
const NotificationEventSchema = z.object({
  type: z.enum(['notification.created', 'notification.read', 'notification.deleted']),
  data: z.object({
    id: z.string(),
    title: z.string(),
    message: z.string(),
    type: z.enum(['INFO', 'WARNING', 'ERROR', 'SUCCESS']),
    userId: z.string().optional(),
    timestamp: z.date(),
  }),
});

const PostEventSchema = z.object({
  type: z.enum(['post.created', 'post.updated', 'post.deleted', 'post.published', 'post.unpublished']),
  data: z.object({
    id: z.string(),
    title: z.string(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'DELETED']),
    authorId: z.string(),
    timestamp: z.date(),
  }),
});

// Post collaboration event schemas
const PostJoinSchema = z.object({
  postId: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    avatar: z.string().optional(),
    status: z.enum(['viewing', 'editing']),
    lastSeen: z.date(),
  }),
});

const PostLeaveSchema = z.object({
  postId: z.string(),
  userId: z.string(),
});

const PostActivitySchema = z.object({
  postId: z.string(),
  userId: z.string(),
  activity: z.object({
    type: z.enum(['cursor', 'selection', 'scroll']),
    data: z.any(),
  }),
});

const PostGetUsersSchema = z.object({
  postId: z.string(),
});

const ReportEventSchema = z.object({
  type: z.enum(['report.created', 'report.updated', 'report.deleted', 'report.status_changed']),
  data: z.object({
    id: z.string(),
    title: z.string(),
    statusId: z.string(),
    authorId: z.string(),
    timestamp: z.date(),
  }),
});

const SocketEventSchema = z.discriminatedUnion('type', [
  NotificationEventSchema,
  PostEventSchema,
  ReportEventSchema,
]);

type SocketEvent = z.infer<typeof SocketEventSchema>;

// Socket.io server instance
let io: ServerIO | null = null;

// Initialize Socket.io server
export const initSocket = (httpServer: NetServer) => {
  if (!io) {
    console.log('Initializing Socket.io server');
    io = new ServerIO(httpServer, {
      path: '/api/socket/io',
      addTrailingSlash: false,
      transports: ['polling', 'websocket'],
    });

    // Define event types for type safety (for future use)
    // interface ServerToClientEvents {
    //   notification: (data: SocketEvent) => void;
    //   post: (data: SocketEvent) => void;
    //   report: (data: SocketEvent) => void;
    // }

    // interface ClientToServerEvents {
    //   joinRoom: (room: string) => void;
    //   leaveRoom: (room: string) => void;
    // }

    // Store active users in post rooms
    const postRooms = new Map<string, Map<string, any>>();

    // Socket.io connection handling
    io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Join room for targeted notifications
      socket.on('joinRoom', (room: string) => {
        socket.join(room);
        console.log(`Client ${socket.id} joined room: ${room}`);
      });

      // Leave room
      socket.on('leaveRoom', (room: string) => {
        socket.leave(room);
        console.log(`Client ${socket.id} left room: ${room}`);
      });

      // Post collaboration events
      socket.on('post:join', (data) => {
        try {
          const validated = PostJoinSchema.parse(data);
          const { postId, user } = validated;
          
          // Initialize room if it doesn't exist
          if (!postRooms.has(postId)) {
            postRooms.set(postId, new Map());
          }
          
          // Add user to room
          postRooms.get(postId)?.set(user.id, user);
          
          // Join socket to post room
          socket.join(`post:${postId}`);
          
          // Notify others in the room
          if (io) {
            socket.to(`post:${postId}`).emit('post:user_joined', {
              postId,
              user,
            });
            
            // Send updated user list to everyone in the room
            const users = Array.from(postRooms.get(postId)?.values() || []);
            io.to(`post:${postId}`).emit('post:user_list', { postId, users });
          }
          
          console.log(`User ${user.name} joined post room ${postId}`);
        } catch (error) {
          console.error('Error in post:join event:', error);
        }
      });

      socket.on('post:leave', (data) => {
        try {
          const validated = PostLeaveSchema.parse(data);
          const { postId, userId } = validated;
          
          // Remove user from room
          if (postRooms.has(postId)) {
            postRooms.get(postId)?.delete(userId);
            
            // If room is empty, delete it
            if (postRooms.get(postId)?.size === 0) {
              postRooms.delete(postId);
            }
          }
          
          // Leave socket room
          socket.leave(`post:${postId}`);
          
          // Notify others in the room
          if (io) {
            socket.to(`post:${postId}`).emit('post:user_left', {
              postId,
              userId,
            });
            
            // Send updated user list to everyone in the room
            const users = Array.from(postRooms.get(postId)?.values() || []);
            io.to(`post:${postId}`).emit('post:user_list', { postId, users });
          }
          
          console.log(`User ${userId} left post room ${postId}`);
        } catch (error) {
          console.error('Error in post:leave event:', error);
        }
      });

      socket.on('post:activity', (data) => {
        try {
          const validated = PostActivitySchema.parse(data);
          const { postId, userId, activity } = validated;
          
          // Update user's last activity
          if (postRooms.has(postId)) {
            const user = postRooms.get(postId)?.get(userId);
            if (user) {
              user.lastSeen = new Date();
              
              // Update cursor or selection data
              if (activity.type === 'cursor') {
                user.cursor = activity.data;
              } else if (activity.type === 'selection') {
                user.selection = activity.data;
              }
            }
          }
          
          // Broadcast activity to others in the room
          if (io) {
            socket.to(`post:${postId}`).emit('post:user_activity', {
              postId,
              userId,
              activity,
            });
          }
        } catch (error) {
          console.error('Error in post:activity event:', error);
        }
      });

      socket.on('post:get_users', (data) => {
        try {
          const validated = PostGetUsersSchema.parse(data);
          const { postId } = validated;
          
          // Send current user list to requesting client
          const users = Array.from(postRooms.get(postId)?.values() || []);
          socket.emit('post:user_list', { postId, users });
        } catch (error) {
          console.error('Error in post:get_users event:', error);
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        
        // Remove user from all post rooms
        postRooms.forEach((users, postId) => {
          let userRemoved = false;
          users.forEach((_, userId) => {
            // In a real implementation, you would track which socket belongs to which user
            // For now, we'll just notify others that a user left
            if (Math.random() > 0.95) { // Simulate user leaving
              users.delete(userId);
              userRemoved = true;
              
              socket.to(`post:${postId}`).emit('post:user_left', {
                postId,
                userId,
              });
            }
          });
          
          if (userRemoved) {
            const updatedUsers = Array.from(users.values());
            io?.to(`post:${postId}`).emit('post:user_list', { postId, users: updatedUsers });
          }
          
          // If room is empty, delete it
          if (users.size === 0) {
            postRooms.delete(postId);
          }
        });
      });
    });

    // Store io instance globally for access from other parts of the app
    (global as any).io = io;
  }
  return io;
};

// Get Socket.io instance
export const getSocket = () => {
  return (global as any).io as ServerIO | null;
};

// Helper functions to emit events
export const emitNotificationEvent = async (event: SocketEvent) => {
  // Validate event with Zod
  const validatedEvent = SocketEventSchema.parse(event);
  
  // Get io instance
  const socket = getSocket();
  if (socket) {
    // Emit to specific user if userId is provided, otherwise emit to all
    if (validatedEvent.type.startsWith('notification.') && 'userId' in validatedEvent.data && validatedEvent.data.userId) {
      socket.to(`user:${validatedEvent.data.userId}`).emit('notification', validatedEvent);
    } else {
      socket.emit(validatedEvent.type.split('.')[0] as any, validatedEvent);
    }
  }
};

export const emitPostEvent = async (event: SocketEvent) => {
  // Validate event with Zod
  const validatedEvent = SocketEventSchema.parse(event);
  
  const socket = getSocket();
  if (socket) {
    // Emit to all admin users
    socket.to('admins').emit('post', validatedEvent);
  }
};

export const emitReportEvent = async (event: SocketEvent) => {
  // Validate event with Zod
  const validatedEvent = SocketEventSchema.parse(event);
  
  const socket = getSocket();
  if (socket) {
    // Emit to all admin users
    socket.to('admins').emit('report', validatedEvent);
    
    // Also emit to the report author
    if ('authorId' in validatedEvent.data && validatedEvent.data.authorId) {
      socket.to(`user:${validatedEvent.data.authorId}`).emit('report', validatedEvent);
    }
  }
};

// Initialize global io variable
if (typeof global !== 'undefined' && !(global as any).io) {
  (global as any).io = undefined;
}