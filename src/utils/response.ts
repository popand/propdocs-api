import { FastifyReply } from 'fastify';
import { StatusCodes } from 'http-status-codes';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string | undefined;
  data?: T | undefined;
  pagination?: PaginationInfo | undefined;
  timestamp: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export class ResponseBuilder {
  static success<T>(
    reply: FastifyReply,
    data?: T,
    message?: string,
    statusCode: number = StatusCodes.OK
  ): FastifyReply {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    return reply.status(statusCode).send(response);
  }

  static created<T>(
    reply: FastifyReply,
    data?: T,
    message: string = 'Resource created successfully'
  ): FastifyReply {
    return ResponseBuilder.success(reply, data, message, StatusCodes.CREATED);
  }

  static updated<T>(
    reply: FastifyReply,
    data?: T,
    message: string = 'Resource updated successfully'
  ): FastifyReply {
    return ResponseBuilder.success(reply, data, message, StatusCodes.OK);
  }

  static deleted(
    reply: FastifyReply,
    message: string = 'Resource deleted successfully'
  ): FastifyReply {
    return ResponseBuilder.success(reply, undefined, message, StatusCodes.OK);
  }

  static paginated<T>(
    reply: FastifyReply,
    paginatedData: PaginatedData<T>,
    message?: string
  ): FastifyReply {
    const { items, total, page, limit } = paginatedData;
    const totalPages = Math.ceil(total / limit);

    const pagination: PaginationInfo = {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };

    const response: ApiResponse<T[]> = {
      success: true,
      message,
      data: items,
      pagination,
      timestamp: new Date().toISOString(),
    };

    return reply.status(StatusCodes.OK).send(response);
  }

  static noContent(reply: FastifyReply): FastifyReply {
    return reply.status(StatusCodes.NO_CONTENT).send();
  }
}

// Utility functions for common responses
export function successResponse<T>(
  reply: FastifyReply,
  data?: T,
  message?: string,
  statusCode?: number
): FastifyReply {
  return ResponseBuilder.success(reply, data, message, statusCode);
}

export function createdResponse<T>(
  reply: FastifyReply,
  data?: T,
  message?: string
): FastifyReply {
  return ResponseBuilder.created(reply, data, message);
}

export function updatedResponse<T>(
  reply: FastifyReply,
  data?: T,
  message?: string
): FastifyReply {
  return ResponseBuilder.updated(reply, data, message);
}

export function deletedResponse(
  reply: FastifyReply,
  message?: string
): FastifyReply {
  return ResponseBuilder.deleted(reply, message);
}

export function paginatedResponse<T>(
  reply: FastifyReply,
  paginatedData: PaginatedData<T>,
  message?: string
): FastifyReply {
  return ResponseBuilder.paginated(reply, paginatedData, message);
}

export function noContentResponse(reply: FastifyReply): FastifyReply {
  return ResponseBuilder.noContent(reply);
}