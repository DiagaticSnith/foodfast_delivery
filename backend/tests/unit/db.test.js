describe('src/config/db connectDB', () => {
  let consoleLogSpy;
  let consoleWarnSpy;
  let consoleErrorSpy;
  let exitSpy;

  beforeEach(() => {
    jest.resetModules();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    exitSpy.mockRestore();
  });

  test('authenticate succeeds and query succeeds -> logs connected', async () => {
    // Provide a mock Sequelize constructor returning an object with desired behavior
    jest.doMock('sequelize', () => ({
      Sequelize: function () {
        this.authenticate = jest.fn().mockResolvedValue();
        this.query = jest.fn().mockResolvedValue();
      }
    }));

    const { connectDB } = require('../../src/config/db');

    await connectDB();

    expect(consoleLogSpy).toHaveBeenCalledWith('MySQL Connected');
    expect(consoleWarnSpy).not.toHaveBeenCalled();
    expect(exitSpy).not.toHaveBeenCalled();
  });

  test('authenticate succeeds but query fails -> warns but does not exit', async () => {
    jest.doMock('sequelize', () => ({
      Sequelize: function () {
        this.authenticate = jest.fn().mockResolvedValue();
        this.query = jest.fn().mockRejectedValue(new Error('query fail'));
      }
    }));

    const { connectDB } = require('../../src/config/db');

    await connectDB();

    expect(consoleLogSpy).toHaveBeenCalledWith('MySQL Connected');
    expect(consoleWarnSpy).toHaveBeenCalled();
    expect(exitSpy).not.toHaveBeenCalled();
  });

  test('authenticate fails -> logs error and exits', async () => {
    jest.doMock('sequelize', () => ({
      Sequelize: function () {
        this.authenticate = jest.fn().mockRejectedValue(new Error('auth fail'));
        this.query = jest.fn();
      }
    }));

    const { connectDB } = require('../../src/config/db');

    await connectDB();

    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
