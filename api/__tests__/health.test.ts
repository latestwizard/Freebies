import { describe, it, expect } from 'vitest';
import handler from '../health';
import type { VercelRequest, VercelResponse } from '@vercel/node';

describe('Vercel Serverless Function: api/health', () => {
  it('returns HTTP 200 with healthy status JSON metrics', () => {
    const req = {} as VercelRequest;

    let statusCode = 0;
    let jsonBody: Record<string, unknown> = {};
    const headers: Record<string, string> = {};

    const res = {
      setHeader: (key: string, value: string) => {
        headers[key] = value;
        return res;
      },
      status: (code: number) => {
        statusCode = code;
        return res;
      },
      json: (body: Record<string, unknown>) => {
        jsonBody = body;
        return res;
      },
    } as unknown as VercelResponse;

    handler(req, res);

    expect(statusCode).toBe(200);
    expect(jsonBody.status).toBe('healthy');
    expect(typeof jsonBody.totalDealsCount).toBe('number');
    expect((jsonBody.totalDealsCount as number)).toBeGreaterThan(0);
    expect(headers['Content-Type']).toBe('application/json');
  });
});
