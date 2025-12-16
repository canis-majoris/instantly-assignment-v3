/**
 * Tests for Email Stats API Route
 */

import { GET } from './route';

describe('stats API', () => {
  describe('GET /api/emails/stats', () => {
    it('returns email statistics with success status', async () => {
      const response = await GET();
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.status).toBe('success');
      expect(body.data).toBeDefined();
    });

    it('returns all required stat fields', async () => {
      const response = await GET();
      const body = await response.json();

      expect(body.data).toHaveProperty('total');
      expect(body.data).toHaveProperty('unread');
      expect(body.data).toHaveProperty('important');
      expect(body.data).toHaveProperty('sent');
      expect(body.data).toHaveProperty('deleted');
    });

    it('returns numeric values for all stats', async () => {
      const response = await GET();
      const body = await response.json();

      expect(typeof body.data.total).toBe('number');
      expect(typeof body.data.unread).toBe('number');
      expect(typeof body.data.important).toBe('number');
      expect(typeof body.data.sent).toBe('number');
      expect(typeof body.data.deleted).toBe('number');
    });

    it('returns non-negative counts', async () => {
      const response = await GET();
      const body = await response.json();

      expect(body.data.total).toBeGreaterThanOrEqual(0);
      expect(body.data.unread).toBeGreaterThanOrEqual(0);
      expect(body.data.important).toBeGreaterThanOrEqual(0);
      expect(body.data.sent).toBeGreaterThanOrEqual(0);
      expect(body.data.deleted).toBeGreaterThanOrEqual(0);
    });
  });
});
