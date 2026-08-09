import { describe, it, expect, vi } from 'vitest';
import handler from '../go';
import type { VercelRequest, VercelResponse } from '@vercel/node';

describe('Vercel Serverless Function: api/go', () => {
  it('returns 400 if deal ID parameter is missing', () => {
    const req = { query: {} } as VercelRequest;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as VercelResponse;

    handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing deal ID' });
  });

  it('redirects to homepage with error if deal is not found', () => {
    const req = { query: { id: 'unknown-deal-id' } } as VercelRequest;
    const res = {
      redirect: vi.fn(),
    } as unknown as VercelResponse;

    handler(req, res);

    expect(res.redirect).toHaveBeenCalledWith(302, '/?error=deal_not_found');
  });

  it('redirects 302 to actual referral URL for valid deal', () => {
    const req = { query: { id: 'digitalocean-credits' } } as VercelRequest;
    const res = {
      setHeader: vi.fn(),
      redirect: vi.fn(),
    } as unknown as VercelResponse;

    handler(req, res);

    expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
    expect(res.redirect).toHaveBeenCalledWith(302, expect.stringContaining('m.do.co'));
  });
});
