import { FastifyReply, FastifyRequest } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { ZodError } from 'zod';
import { Prisma } from '../generated/prisma';

export interface ApiError extends Error {
  statusCode: number;
  code?: string;
}

export class CustomError extends Error implements ApiError {
  public statusCode: number;
  public code?: string;

  constructor(message: string, statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR, code?: string) {
    super(message);
    this.name = 'CustomError';
    this.statusCode = statusCode;
    if (code !== undefined) {
      this.code = code;
    }
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends CustomError {
  constructor(message: string = 'Validation failed') {
    super(message, StatusCodes.BAD_REQUEST, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string = 'Resource not found') {
    super(message, StatusCodes.NOT_FOUND, 'RESOURCE_NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message: string = 'Unauthorized access') {
    super(message, StatusCodes.UNAUTHORIZED, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends CustomError {
  constructor(message: string = 'Forbidden access') {
    super(message, StatusCodes.FORBIDDEN, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends CustomError {
  constructor(message: string = 'Resource conflict') {
    super(message, StatusCodes.CONFLICT, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

function formatZodError(error: ZodError): string {
  return error.issues
    .map((err: any) => `${err.path.join('.')}: ${err.message}`)
    .join(', ');
}

function formatPrismaError(error: Prisma.PrismaClientKnownRequestError): { message: string; statusCode: number; code: string } {
  switch (error.code) {
    case 'P2002':
      return {
        message: 'A record with this data already exists',
        statusCode: StatusCodes.CONFLICT,
        code: 'DUPLICATE_RECORD',
      };
    case 'P2025':
      return {
        message: 'Record not found',
        statusCode: StatusCodes.NOT_FOUND,
        code: 'RECORD_NOT_FOUND',
      };
    case 'P2003':
      return {
        message: 'Foreign key constraint violation',
        statusCode: StatusCodes.BAD_REQUEST,
        code: 'FOREIGN_KEY_VIOLATION',
      };
    case 'P2014':
      return {
        message: 'Invalid data provided',
        statusCode: StatusCodes.BAD_REQUEST,
        code: 'INVALID_DATA',
      };
    default:
      return {
        message: 'Database operation failed',
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        code: 'DATABASE_ERROR',
      };
  }
}

export async function errorHandler(
  error: any,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Log the error
  request.log.error({
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode,
    },
    request: {
      method: request.method,
      url: request.url,
      headers: request.headers,
    },
  }, 'Request error occurred');

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return reply.status(StatusCodes.BAD_REQUEST).send({
      error: 'Validation Error',
      message: formatZodError(error),
      code: 'VALIDATION_ERROR',
      statusCode: StatusCodes.BAD_REQUEST,
      timestamp: new Date().toISOString(),
    });
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const { message, statusCode, code } = formatPrismaError(error);
    return reply.status(statusCode).send({
      error: 'Database Error',
      message,
      code,
      statusCode,
      timestamp: new Date().toISOString(),
    });
  }

  // Handle Prisma validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    return reply.status(StatusCodes.BAD_REQUEST).send({
      error: 'Database Validation Error',
      message: 'Invalid data provided to database',
      code: 'DATABASE_VALIDATION_ERROR',
      statusCode: StatusCodes.BAD_REQUEST,
      timestamp: new Date().toISOString(),
    });
  }

  // Handle custom API errors
  if (error instanceof CustomError || error.statusCode) {
    const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    return reply.status(statusCode).send({
      error: error.name || 'API Error',
      message: error.message,
      code: error.code || 'API_ERROR',
      statusCode,
      timestamp: new Date().toISOString(),
    });
  }

  // Handle Fastify validation errors
  if (error.validation) {
    return reply.status(StatusCodes.BAD_REQUEST).send({
      error: 'Validation Error',
      message: 'Request validation failed',
      details: error.validation,
      code: 'REQUEST_VALIDATION_ERROR',
      statusCode: StatusCodes.BAD_REQUEST,
      timestamp: new Date().toISOString(),
    });
  }

  // Handle all other errors as internal server errors
  return reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred',
    code: 'INTERNAL_SERVER_ERROR',
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    timestamp: new Date().toISOString(),
  });
}