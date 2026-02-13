import { NextResponse } from 'next/server';
import { logger } from './logger';

export interface ErrorContext {
  method?: string;
  url?: string;
  userId?: string;
  userRole?: string;
}

export function handleError(
  error: any,
  context: ErrorContext = {},
  statusCode: number = 500
): NextResponse {
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Log the error with context
  logger.error('API Error occurred', {
    error: error.message || 'Unknown error',
    stack: isDevelopment ? error.stack : 'REDACTED',
    context,
    statusCode,
  });

  // Return safe response
  const safeMessage = isDevelopment
    ? error.message || 'An error occurred'
    : 'Something went wrong. Please try again later.';

  return NextResponse.json(
    {
      success: false,
      message: safeMessage,
      ...(isDevelopment && {
        stack: error.stack,
        context,
      }),
    },
    { status: statusCode }
  );
}

export function handleValidationError(
  errors: any[],
  context: ErrorContext = {}
): NextResponse {
  logger.warn('Validation error occurred', {
    errors,
    context,
  });

  return NextResponse.json(
    {
      success: false,
      message: 'Validation failed',
      errors,
    },
    { status: 400 }
  );
}
