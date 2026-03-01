import { FastifyRequest, FastifyReply } from 'fastify';
import { supabaseAdmin } from '../config/supabase';

// Module augmentation for Fastify request
declare module 'fastify' {
  interface FastifyRequest {
    supabaseUserId: string;
    userEmail: string;
  }
}

export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Missing or invalid Authorization header',
      code: 'MISSING_TOKEN',
      statusCode: 401,
      timestamp: new Date().toISOString(),
    });
  }

  const token = authHeader.substring(7);

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
      code: 'INVALID_TOKEN',
      statusCode: 401,
      timestamp: new Date().toISOString(),
    });
  }

  request.supabaseUserId = user.id;
  request.userEmail = user.email || '';
}
