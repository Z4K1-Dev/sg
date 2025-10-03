'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

// Socket.io event types
export interface NotificationEvent {
  type: 'notification.created' | 'notification.read' | 'notification.deleted';
  data: {
    id: string;
    title: string;
    message: string;
    type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
    userId?: string;
    timestamp: Date;
  };
}

export interface PostEvent {
  type: 'post.created' | 'post.updated' | 'post.deleted' | 'post.published' | 'post.unpublished';
  data: {
    id: string;
    title: string;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    authorId: string;
    timestamp: Date;
  };
}

export interface ReportEvent {
  type: 'report.created' | 'report.updated' | 'report.deleted' | 'report.status_changed';
  data: {
    id: string;
    title: string;
    statusId: string;
    authorId: string;
    timestamp: Date;
  };
}

export type SocketEvent = NotificationEvent | PostEvent | ReportEvent;

// Custom hook for Socket.io connection
export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    // Only connect on client side
    if (typeof window === 'undefined') return;

    const socketInstance = io({
      path: '/api/socket/io',
      addTrailingSlash: false,
      transports: ['polling', 'websocket'],
    });

    socketInstance.on('connect', () => {
      console.log('Connected to Socket.io server');
      setIsConnected(true);
      
      // Join user-specific room if authenticated
      if (session?.user?.id) {
        socketInstance.emit('joinRoom', `user:${session.user.id}`);
      }
      
      // Join admin room if user is admin
      if ((session?.user as any)?.role === 'ADMIN') {
        socketInstance.emit('joinRoom', 'admins');
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from Socket.io server');
      setIsConnected(false);
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, [session]);

  return { socket, isConnected };
};

// Custom hook for listening to specific Socket.io events
export const useSocketEvent = (
  eventName: string,
  callback: (data: any) => void,
  deps: any[] = []
) => {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on(eventName, callback);

    // Cleanup
    return () => {
      socket.off(eventName, callback);
    };
  }, [socket, eventName, callback, ...deps]);
};

// Custom hooks for specific event types
export const useNotificationEvents = (callback: (event: NotificationEvent) => void) => {
  return useSocketEvent('notification', callback, [callback]);
};

export const usePostEvents = (callback: (event: PostEvent) => void) => {
  return useSocketEvent('post', callback, [callback]);
};

export const useReportEvents = (callback: (event: ReportEvent) => void) => {
  return useSocketEvent('report', callback, [callback]);
};

// Helper function to emit events from client (if needed)
export const emitSocketEvent = (eventName: string, data: any) => {
  if (typeof window === 'undefined') return;

  const socket = io({
    path: '/api/socket/io',
    addTrailingSlash: false,
    transports: ['polling', 'websocket'],
  });

  socket.emit(eventName, data);
};