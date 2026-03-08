import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

function buildHost(url = '/test', method = 'GET') {
  const json = vi.fn();
  const mockResponse = {
    status: vi.fn().mockReturnValue({ json }),
  };
  const mockRequest = { url, method };
  const host = {
    switchToHttp: vi.fn().mockReturnValue({
      getResponse: vi.fn().mockReturnValue(mockResponse),
      getRequest: vi.fn().mockReturnValue(mockRequest),
    }),
  } as unknown as ArgumentsHost;
  return { host, json };
}

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
  });

  it('formats a plain string exception as Problem Details', () => {
    const { host, json } = buildHost('/auth/login');

    filter.catch(new HttpException('Credenciales inválidas', HttpStatus.UNAUTHORIZED), host);

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'https://httpstatuses.com/401',
        title: 'Unauthorized',
        status: 401,
        detail: 'Credenciales inválidas',
        instance: '/auth/login',
      }),
    );
  });

  it('uses "Validation failed" as detail and exposes errors array for 400s', () => {
    const { host, json } = buildHost('/quotes');
    const exception = new HttpException(
      {
        statusCode: 400,
        message: ['age must be a number', 'location is required'],
        error: 'Bad Request',
      },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, host);

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 400,
        detail: 'Validation failed',
        errors: ['age must be a number', 'location is required'],
      }),
    );
  });

  it('uses the message string as detail when response body has a string message', () => {
    const { host, json } = buildHost('/quotes/nonexistent');
    const exception = new HttpException(
      { statusCode: 404, message: "Cotización con id 'abc' no encontrada", error: 'Not Found' },
      HttpStatus.NOT_FOUND,
    );

    filter.catch(exception, host);

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ detail: "Cotización con id 'abc' no encontrada" }),
    );
  });

  it('sets instance to the request URL', () => {
    const { host, json } = buildHost('/policies/some-uuid');

    filter.catch(new HttpException('Not Found', HttpStatus.NOT_FOUND), host);

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ instance: '/policies/some-uuid' }),
    );
  });

  it('does not include errors field when response is not a validation error', () => {
    const { host, json } = buildHost();

    filter.catch(new HttpException('something went wrong', HttpStatus.CONFLICT), host);

    const call = json.mock.calls[0][0];
    expect(call).not.toHaveProperty('errors');
  });

  it.each([
    [HttpStatus.BAD_REQUEST, 'Bad Request'],
    [HttpStatus.UNAUTHORIZED, 'Unauthorized'],
    [HttpStatus.FORBIDDEN, 'Forbidden'],
    [HttpStatus.NOT_FOUND, 'Not Found'],
    [HttpStatus.CONFLICT, 'Conflict'],
    [HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error'],
  ])('maps HTTP status %i to title "%s"', (status, expectedTitle) => {
    const { host, json } = buildHost();

    filter.catch(new HttpException('msg', status), host);

    expect(json).toHaveBeenCalledWith(expect.objectContaining({ title: expectedTitle }));
  });
});
