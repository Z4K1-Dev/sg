import { NextApiResponse } from 'next';
import { initSocket } from './init';

// Socket.io server handler for Next.js Pages API
export const SocketHandler = (_req: any, res: NextApiResponse & { socket: any }) => {
  if (res.socket.server.io) {
    console.log('Socket.io already running');
  } else {
    console.log('Socket.io server initializing');
    const httpServer: any = res.socket.server;
    initSocket(httpServer);
  }
  res.end();
};

// Export individual HTTP methods for Next.js App Router
export const GET = SocketHandler;
export const POST = SocketHandler;
export const PUT = SocketHandler;
export const DELETE = SocketHandler;
export const PATCH = SocketHandler;

export const config = {
  api: {
    bodyParser: false,
  },
};