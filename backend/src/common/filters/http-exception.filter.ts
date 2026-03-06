import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  errors?: unknown;
}

/**
 * Global HTTP Exception Filter
 * Returns errors in Problem Details format (RFC 7807)
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let detail: string;
    let errors: unknown;

    if (typeof exceptionResponse === 'string') {
      detail = exceptionResponse;
    } else if (typeof exceptionResponse === 'object') {
      const res = exceptionResponse as Record<string, unknown>;
      detail = (res.message as string) || exception.message;
      if (Array.isArray(res.message)) {
        detail = 'Validation failed';
        errors = res.message;
      }
    } else {
      detail = exception.message;
    }

    this.logger.error(
      `[${request.method}] ${request.url} -> ${status}: ${detail}`,
    );

    const problemDetails: ProblemDetails = {
      type: `https://httpstatuses.com/${status}`,
      title: this.getTitle(status),
      status,
      detail,
      instance: request.url,
    };
    if (errors) {
      problemDetails.errors = errors;
    }

    response.status(status).json(problemDetails);
  }

  private getTitle(status: number): string {
    const titles: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'Bad Request',
      [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
      [HttpStatus.FORBIDDEN]: 'Forbidden',
      [HttpStatus.NOT_FOUND]: 'Not Found',
      [HttpStatus.CONFLICT]: 'Conflict',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
    };
    return titles[status] || 'Error';
  }
}
