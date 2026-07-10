import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import authRouter from './routes/auth.js';
import healthRouter from './routes/health.js';
import connectorRouter from './routes/connectors.js';
import analyticsRouter from './routes/analytics.js';
import eventsRouter from './routes/events.js';
import logger from './utils/logger.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/health', healthRouter);
app.use('/api/connectors', connectorRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/events', eventsRouter);

io.on('connection', (socket) => {
  socket.on('join', (room) => socket.join(room));
  socket.emit('connected', { message: 'Socket connected' });
});

app.use(notFoundHandler);
app.use(errorHandler);

export { app, httpServer, io };
