'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Users,
  Eye,
  Edit,
  Loader2,
  User,
  AlertCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useSocket } from '@/lib/socket/client';
import { useSession } from 'next-auth/react';

// Types
interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'viewing' | 'editing';
  lastSeen: Date;
  cursor?: {
    line: number;
    column: number;
  };
  selection?: {
    start: number;
    end: number;
    text: string;
  };
}

interface PostCollaborationProps {
  postId: string;
  postTitle: string;
  onUserJoin?: (user: CollaborationUser) => void;
  onUserLeave?: (userId: string) => void;
  onUserActivity?: (userId: string, activity: any) => void;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function PostCollaboration({
  postId,
  postTitle,
  onUserJoin,
  onUserLeave,
  onUserActivity,
  showLabel = true,
  size = 'md',
}: PostCollaborationProps) {
  const [activeUsers, setActiveUsers] = useState<CollaborationUser[]>([]);
  const [isJoining, setIsJoining] = useState(false);
  const { socket, isConnected } = useSocket();
  const { data: session } = useSession();

  // Join collaboration room when component mounts
  useEffect(() => {
    if (!socket || !isConnected || !session?.user?.id || !postId) return;

    const userId = session.user.id;
    const userName = session.user.name || 'Unknown User';
    const userEmail = session.user.email || '';
    const userAvatar = (session.user as any)?.avatar || '';

    setIsJoining(true);

    // Join post-specific collaboration room
    socket.emit('joinRoom', `post:${postId}`);

    // Announce user presence
    socket.emit('post:join', {
      postId,
      user: {
        id: userId,
        name: userName,
        email: userEmail,
        avatar: userAvatar,
        status: 'editing',
        lastSeen: new Date(),
      },
    });

    // Listen for collaboration events
    const handleUserJoined = (data: { postId: string; user: CollaborationUser }) => {
      if (data.postId === postId && data.user.id !== userId) {
        setActiveUsers(prev => {
          const existing = prev.find(u => u.id === data.user.id);
          if (existing) {
            return prev.map(u => 
              u.id === data.user.id 
                ? { ...data.user, lastSeen: new Date() }
                : u
            );
          }
          return [...prev, { ...data.user, lastSeen: new Date() }];
        });
        onUserJoin?.(data.user);
        
        toast({
          title: "User Joined",
          description: `${data.user.name} is now viewing "${postTitle}"`,
        });
      }
    };

    const handleUserLeft = (data: { postId: string; userId: string }) => {
      if (data.postId === postId) {
        setActiveUsers(prev => prev.filter(u => u.id !== data.userId));
        onUserLeave?.(data.userId);
      }
    };

    const handleUserActivity = (data: { 
      postId: string; 
      userId: string; 
      activity: {
        type: 'cursor' | 'selection' | 'scroll';
        data: any;
      };
    }) => {
      if (data.postId === postId) {
        setActiveUsers(prev => prev.map(u => 
          u.id === data.userId 
            ? { 
                ...u, 
                lastSeen: new Date(),
                ...(data.activity.type === 'cursor' && { cursor: data.activity.data }),
                ...(data.activity.type === 'selection' && { selection: data.activity.data }),
              }
            : u
        ));
        onUserActivity?.(data.userId, data.activity);
      }
    };

    const handleUserList = (data: { postId: string; users: CollaborationUser[] }) => {
      if (data.postId === postId) {
        setActiveUsers(data.users.filter(u => u.id !== userId));
      }
    };

    // Register event listeners
    socket.on('post:user_joined', handleUserJoined);
    socket.on('post:user_left', handleUserLeft);
    socket.on('post:user_activity', handleUserActivity);
    socket.on('post:user_list', handleUserList);

    // Request current user list
    socket.emit('post:get_users', { postId });

    setIsJoining(false);

    // Cleanup on unmount
    return () => {
      socket.emit('post:leave', { postId, userId });
      socket.emit('leaveRoom', `post:${postId}`);
      
      socket.off('post:user_joined', handleUserJoined);
      socket.off('post:user_left', handleUserLeft);
      socket.off('post:user_activity', handleUserActivity);
      socket.off('post:user_list', handleUserList);
    };
  }, [socket, isConnected, session, postId, postTitle, onUserJoin, onUserLeave, onUserActivity]);


  // Remove inactive users (haven't been seen for 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setActiveUsers(prev => prev.filter(user => {
        const timeDiff = now.getTime() - user.lastSeen.getTime();
        return timeDiff < 30000; // 30 seconds
      }));
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'editing':
        return <Edit className="h-3 w-3 text-green-600" />;
      case 'viewing':
        return <Eye className="h-3 w-3 text-blue-600" />;
      default:
        return <User className="h-3 w-3 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'editing':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'viewing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-2 text-base';
      default:
        return 'px-3 py-1.5 text-sm';
    }
  };

  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    
    if (diffSecs < 5) return 'Active now';
    if (diffSecs < 60) return `${diffSecs}s ago`;
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;
    return 'Recently';
  };

  if (!isConnected) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={`${getSizeClasses()} opacity-50`}>
              <AlertCircle className="h-3 w-3 mr-1" />
              {showLabel && 'Offline'}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Real-time collaboration is not available</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {activeUsers.length > 0 ? (
          <Popover>
            <PopoverTrigger asChild>
              <Badge variant="outline" className={`${getSizeClasses()} cursor-pointer`}>
                <Users className="h-3 w-3 mr-1" />
                {activeUsers.length}
                {showLabel && ` active user${activeUsers.length !== 1 ? 's' : ''}`}
              </Badge>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Active Collaborators</h4>
                  <span className="text-xs text-gray-500">{postTitle}</span>
                </div>
                
                <div className="space-y-2">
                  {activeUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{user.name}</span>
                            {getStatusIcon(user.status)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatLastSeen(user.lastSeen)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-xs ${getStatusColor(user.status)}`}>
                          {user.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                
                {activeUsers.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No active collaborators</p>
                  </div>
                )}
                
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Real-time collaboration</span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Connected</span>
                    </div>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <Badge variant="outline" className={`${getSizeClasses()}`}>
            <Users className="h-3 w-3 mr-1" />
            {showLabel && 'No collaborators'}
          </Badge>
        )}
        
        {isJoining && (
          <Badge variant="outline" className={`${getSizeClasses()}`}>
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Joining...
          </Badge>
        )}
      </div>
    </TooltipProvider>
  );
}

// Hook for post collaboration
export function usePostCollaboration(postId: string) {
  const [activeUsers, setActiveUsers] = useState<CollaborationUser[]>([]);
  const { socket, isConnected } = useSocket();
  const { data: session } = useSession();

  useEffect(() => {
    if (!socket || !isConnected || !session?.user?.id || !postId) return;

    const userId = session.user.id;

    // Join post-specific collaboration room
    socket.emit('joinRoom', `post:${postId}`);

    // Listen for collaboration events
    const handleUserJoined = (data: { postId: string; user: CollaborationUser }) => {
      if (data.postId === postId && data.user.id !== userId) {
        setActiveUsers(prev => {
          const existing = prev.find(u => u.id === data.user.id);
          if (existing) {
            return prev.map(u => 
              u.id === data.user.id 
                ? { ...data.user, lastSeen: new Date() }
                : u
            );
          }
          return [...prev, { ...data.user, lastSeen: new Date() }];
        });
      }
    };

    const handleUserLeft = (data: { postId: string; userId: string }) => {
      if (data.postId === postId) {
        setActiveUsers(prev => prev.filter(u => u.id !== data.userId));
      }
    };

    const handleUserActivity = (data: { 
      postId: string; 
      userId: string; 
      activity: {
        type: 'cursor' | 'selection' | 'scroll';
        data: any;
      };
    }) => {
      if (data.postId === postId) {
        setActiveUsers(prev => prev.map(u => 
          u.id === data.userId 
            ? { 
                ...u, 
                lastSeen: new Date(),
                ...(data.activity.type === 'cursor' && { cursor: data.activity.data }),
                ...(data.activity.type === 'selection' && { selection: data.activity.data }),
              }
            : u
        ));
      }
    };

    // Register event listeners
    socket.on('post:user_joined', handleUserJoined);
    socket.on('post:user_left', handleUserLeft);
    socket.on('post:user_activity', handleUserActivity);

    // Request current user list
    socket.emit('post:get_users', { postId });

    // Cleanup on unmount
    return () => {
      socket.emit('post:leave', { postId, userId });
      socket.emit('leaveRoom', `post:${postId}`);
      
      socket.off('post:user_joined', handleUserJoined);
      socket.off('post:user_left', handleUserLeft);
      socket.off('post:user_activity', handleUserActivity);
    };
  }, [socket, isConnected, session, postId]);

  const updateActivity = (activity: {
    type: 'cursor' | 'selection' | 'scroll';
    data: any;
  }) => {
    if (!socket || !isConnected || !session?.user?.id) return;

    socket.emit('post:activity', {
      postId,
      userId: session.user.id,
      activity,
    });
  };

  return {
    activeUsers,
    updateActivity,
    isConnected,
  };
}

// Component for showing user cursors in editor
export function EditorCursors({ postId }: { postId: string }) {
  const { activeUsers } = usePostCollaboration(postId);

  return (
    <div className="relative">
      {activeUsers.map((user) => (
        user.cursor && (
          <div
            key={user.id}
            className="absolute pointer-events-none"
            style={{
              top: `${user.cursor.line * 20}px`,
              left: `${user.cursor.column * 8}px`,
            }}
          >
            <div 
              className="w-0.5 h-5"
              style={{ backgroundColor: getUserColor(user.id) }}
            />
            <div 
              className="px-1 py-0.5 text-xs text-white rounded"
              style={{ backgroundColor: getUserColor(user.id) }}
            >
              {user.name}
            </div>
          </div>
        )
      ))}
    </div>
  );
}

// Helper function to generate consistent colors for users
function getUserColor(userId: string): string {
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e'
  ];
  
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length] || '#000000';
}