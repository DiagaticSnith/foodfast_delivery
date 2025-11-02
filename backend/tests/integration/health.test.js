const request = require('supertest');
const app = require('../../src/app');

describe('integration: /__health', () => {
  test('returns ok JSON', async () => {
    const res = await request(app).get('/__health').expect(200);
    expect(res.body).toEqual({ ok: true });
  });
});
