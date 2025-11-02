const errorHandler = require('../../src/utils/errorHandler');

describe('errorHandler middleware', () => {
  let errorSpy;

  beforeEach(() => {
    // suppress stack logging during tests to keep output clean
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  test('should return 500 with generic message', () => {
    const err = new Error('boom');
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Something went wrong!' });
  });
});
