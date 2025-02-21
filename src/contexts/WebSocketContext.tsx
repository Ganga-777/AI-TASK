import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Task } from './TaskContext';

interface WebSocketContextType {
  isConnected: boolean;
  lastUpdate: Date | null;
  sendUpdate: (type: 'add' | 'update' | 'delete', task: Task) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

const SOCKET_URL = 'ws://localhost:3001'; // Update this with your WebSocket server URL

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const socketInstance = io(SOCKET_URL, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('taskUpdate', (data: { type: string; task: Task; timestamp: string }) => {
      console.log('Received task update:', data);
      setLastUpdate(new Date(data.timestamp));
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const sendUpdate = (type: 'add' | 'update' | 'delete', task: Task) => {
    if (socket && isConnected) {
      socket.emit('taskUpdate', {
        type,
        task,
        timestamp: new Date().toISOString(),
      });
    }
  };

  return (
    <WebSocketContext.Provider value={{ isConnected, lastUpdate, sendUpdate }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
} 