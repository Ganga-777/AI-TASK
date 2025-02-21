import { Server } from 'socket.io';
import { createServer } from 'http';
import express from 'express';
import { Task } from '../types/Task';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

interface TaskUpdate {
  type: 'add' | 'update' | 'delete';
  task: Task;
  timestamp: Date;
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('taskUpdate', (update: TaskUpdate) => {
    // Broadcast the update to all other connected clients
    socket.broadcast.emit('taskUpdate', update);
    console.log('Task update broadcasted:', update);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.WS_PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
}); 