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

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
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