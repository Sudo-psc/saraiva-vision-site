export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, context?: Record<string, unknown>) {
    super(`${resource} não encontrado`, 404, 'NOT_FOUND', context);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 400, 'VALIDATION_ERROR', context);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Não autorizado', context?: Record<string, unknown>) {
    super(message, 401, 'UNAUTHORIZED', context);
    this.name = 'UnauthorizedError';
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Acesso proibido', context?: Record<string, unknown>) {
    super(message, 403, 'FORBIDDEN', context);
    this.name = 'ForbiddenError';
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Erro desconhecido';
}

export function getErrorCode(error: unknown): string | undefined {
  if (error instanceof AppError) {
    return error.code;
  }
  return undefined;
}

export function isClientError(statusCode: number): boolean {
  return statusCode >= 400 && statusCode < 500;
}

export function isServerError(statusCode: number): boolean {
  return statusCode >= 500 && statusCode < 600;
}

export function logError(error: unknown, context?: Record<string, unknown>): void {
  const errorMessage = getErrorMessage(error);
  const errorCode = getErrorCode(error);
  
  console.error('[Error]', {
    message: errorMessage,
    code: errorCode,
    context,
    timestamp: new Date().toISOString(),
    stack: error instanceof Error ? error.stack : undefined,
  });
  
  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
    if (error instanceof AppError) {
      console.error('[AppError]', {
        statusCode: error.statusCode,
        code: error.code,
        context: error.context,
      });
    }
  }
}

export function handleApiError(error: unknown): {
  message: string;
  statusCode: number;
  code?: string;
} {
  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      code: error.code,
    };
  }
  
  if (error instanceof Error) {
    return {
      message: error.message,
      statusCode: 500,
      code: 'INTERNAL_SERVER_ERROR',
    };
  }
  
  return {
    message: 'Erro interno do servidor',
    statusCode: 500,
    code: 'UNKNOWN_ERROR',
  };
}
