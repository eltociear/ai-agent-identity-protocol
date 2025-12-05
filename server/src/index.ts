// AI Agent Identity Protocol - Backend Server
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import agents from './routes/agents.js';
import logs from './routes/logs.js';
import webhooks from './routes/webhooks.js';
import { config } from './utils/config.js';
import type { ApiResponse } from './types/index.js';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: '*', // Configure appropriately for production
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-GitHub-Event', 'X-GitHub-Delivery'],
}));

// Health check
app.get('/', (c) => {
  return c.json<ApiResponse<{ status: string; version: string }>>({
    success: true,
    data: {
      status: 'healthy',
      version: '0.1.0',
    },
  });
});

// API Routes
app.route('/api/agents', agents);
app.route('/api/logs', logs);
app.route('/api/webhooks', webhooks);

// Error handling
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json<ApiResponse<null>>({
    success: false,
    error: 'Internal server error',
  }, 500);
});

// 404 handler
app.notFound((c) => {
  return c.json<ApiResponse<null>>({
    success: false,
    error: 'Not found',
  }, 404);
});

// Start server
const port = config.port;
console.log(`🚀 AAIP Server starting on port ${port}`);
console.log(`📡 Starknet RPC: ${config.starknetRpcUrl}`);

serve({
  fetch: app.fetch,
  port,
});

export default app;
