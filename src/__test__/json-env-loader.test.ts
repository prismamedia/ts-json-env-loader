import { loadEnv, loadEnvSync, objectToEnv } from '../json-env-loader';

describe('env loader', () => {
  const fixtureFolder = process.cwd() + '/src/__test__/fixtures';
  let baseProcessEnv;

  beforeAll(() => {
    baseProcessEnv = { ...process.env };
  });

  beforeEach(() => {
    process.env = { ...baseProcessEnv };
  });

  afterAll(() => {
    process.env = { ...baseProcessEnv };
  });

  it('should load in sync non strict mode', () => {
    loadEnvSync({
      folder: fixtureFolder,
    });

    expect(process.env['CONFIG_1']).toEqual('a');
    expect(process.env['CONFIG_2']).toEqual('b');
    expect(process.env['CONFIG_3']).toEqual('c');
    expect(process.env['LEVEL_2_CONFIG_1']).toEqual('aa');
    expect(process.env['LEVEL_2_CONFIG_2']).toEqual('bb');
  });

  it('should fail in sync strict mode', () => {
    expect(() =>
      loadEnvSync({
        folder: fixtureFolder,
        strict: true,
      }),
    ).toThrow(`file ${fixtureFolder}/config3.env does not contain valid json`);
  });

  it('should match file using include', () => {
    loadEnvSync({
      folder: fixtureFolder,
      include: new RegExp('config1'),
    });

    expect(process.env['CONFIG_1']).toEqual('a');
    expect(process.env['CONFIG_2']).toEqual('b');
    expect(process.env['CONFIG_3']).toBeUndefined;
    expect(process.env['LEVEL_2_CONFIG_1']).toBeUndefined;
    expect(process.env['LEVEL_2_CONFIG_2']).toBeUndefined;
  });

  it('should ignore file using exclude', () => {
    loadEnvSync({
      folder: fixtureFolder,
      exclude: new RegExp('config1'),
    });

    expect(process.env['CONFIG_1']).toBeUndefined;
    expect(process.env['CONFIG_2']).toBeUndefined;
    expect(process.env['CONFIG_3']).toEqual('c');
    expect(process.env['LEVEL_2_CONFIG_1']).toEqual('aa');
    expect(process.env['LEVEL_2_CONFIG_2']).toEqual('bb');
  });

  it('fails on duplicate entries', () => {
    objectToEnv({
      ENTRY1: 'a',
      ENTRY2: 'b',
    });

    expect(() =>
      objectToEnv({
        ENTRY1: 'aa',
      }),
    ).toThrow(`"ENTRY1" is already defined in process.env`);
  });

  it('should load in async non stric mode', async () => {
    await loadEnv({
      folder: fixtureFolder,
    });

    expect(process.env['CONFIG_1']).toEqual('a');
    expect(process.env['CONFIG_2']).toEqual('b');
    expect(process.env['CONFIG_3']).toEqual('c');
    expect(process.env['LEVEL_2_CONFIG_1']).toEqual('aa');
    expect(process.env['LEVEL_2_CONFIG_2']).toEqual('bb');
  });

  it('should fail in sync strict mode', async () => {
    return expect(
      loadEnv({
        folder: fixtureFolder,
        strict: true,
      }),
    ).rejects.toThrow(
      `file ${fixtureFolder}/config3.env does not contain valid json`,
    );
  });
});
