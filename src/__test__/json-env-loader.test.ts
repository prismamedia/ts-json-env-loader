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

    expect(process.env['CONFIG1_CONFIG_1']).toEqual('a');
    expect(process.env['CONFIG1_CONFIG_2']).toEqual('b');
    expect(process.env['CONFIG2_CONFIG_3']).toEqual('c');
    expect(process.env['CONFIG2_LEVEL_2_CONFIG_1']).toEqual('aa');
    expect(process.env['CONFIG2_LEVEL_2_CONFIG_2']).toEqual('bb');
  });

  it('should fail in sync strict mode', () => {
    expect(() =>
      loadEnvSync({
        folder: fixtureFolder,
        strict: true,
      }),
    ).toThrow(`file ${fixtureFolder}/config3.env does not contain valid json`);
  });

  it('should match file using includeFolder', () => {
    loadEnvSync({
      folder: fixtureFolder,
      includeFolder: new RegExp('config1'),
    });

    expect(process.env['CONFIG1_CONFIG_1']).toEqual('a');
    expect(process.env['CONFIG1_CONFIG_2']).toEqual('b');
    expect(process.env['CONFIG2_CONFIG_3']).toBeUndefined;
    expect(process.env['CONFIG2_LEVEL_2_CONFIG_1']).toBeUndefined;
    expect(process.env['CONFIG2_LEVEL_2_CONFIG_2']).toBeUndefined;
  });

  it('should ignore file using excludeFolder', () => {
    loadEnvSync({
      folder: fixtureFolder,
      excludeFolder: new RegExp('config1'),
    });

    expect(process.env['CONFIG1_CONFIG_1']).toBeUndefined;
    expect(process.env['CONFIG1_CONFIG_2']).toBeUndefined;
    expect(process.env['CONFIG2_CONFIG_3']).toEqual('c');
    expect(process.env['CONFIG2_LEVEL_2_CONFIG_1']).toEqual('aa');
    expect(process.env['CONFIG2_LEVEL_2_CONFIG_2']).toEqual('bb');
  });

  it('fails on duplicate entries on throw mode', () => {
    objectToEnv(
      {
        ENTRY1: 'a',
        ENTRY2: 'b',
      },
      '',
      {
        strict: true,
        onDuplicateEntry: 'throw',
        excludeEntry: null,
        includeEntry: null,
      },
    );

    expect(() =>
      objectToEnv(
        {
          ENTRY1: 'aa',
        },
        '',
        {
          strict: true,
          onDuplicateEntry: 'throw',
          excludeEntry: null,
          includeEntry: null,
        },
      ),
    ).toThrow(`"ENTRY1" is already defined in process.env`);
  });

  it('ignores duplicate entries on ignore mode', () => {
    objectToEnv(
      {
        ENTRY1: 'a',
        ENTRY2: 'b',
      },
      '',
      {
        strict: true,
        onDuplicateEntry: 'throw',
        excludeEntry: null,
        includeEntry: null,
      },
    );

    objectToEnv(
      {
        ENTRY1: 'aa',
      },
      '',
      {
        strict: true,
        onDuplicateEntry: 'ignore',
        excludeEntry: null,
        includeEntry: null,
      },
    );

    expect(process.env['ENTRY1']).toEqual('a');
  });

  it('replaces duplicate entries on overwrite mode', () => {
    objectToEnv(
      {
        ENTRY1: 'a',
        ENTRY2: 'b',
      },
      '',
      {
        strict: true,
        onDuplicateEntry: 'throw',
        excludeEntry: null,
        includeEntry: null,
      },
    );

    objectToEnv(
      {
        ENTRY1: 'aa',
      },
      '',
      {
        strict: true,
        onDuplicateEntry: 'overwrite',
        excludeEntry: null,
        includeEntry: null,
      },
    );

    expect(process.env['ENTRY1']).toEqual('aa');
  });

  it('should match entries using includeEntry', () => {
    objectToEnv(
      {
        ENTRY1: 'a',
        ENTRY2: 'b',
        ENTRY3: {
          ENTRY2: 'b',
        },
      },
      '',
      {
        strict: true,
        onDuplicateEntry: 'throw',
        includeEntry: new RegExp('ENTRY2'),
        excludeEntry: null,
      },
    );
    -expect(process.env['ENTRY2']).toEqual('b');
    expect(process.env['ENTRY3_ENTRY2']).toEqual('b');
    expect(process.env['ENTRY1']).toEqual(undefined);
  });

  it('should match entries using excludeEntry', () => {
    objectToEnv(
      {
        ENTRY1: 'a',
        ENTRY2: 'b',
        ENTRY3: {
          ENTRY2: 'b',
        },
      },
      '',
      {
        strict: true,
        onDuplicateEntry: 'throw',
        includeEntry: null,
        excludeEntry: new RegExp('ENTRY2'),
      },
    );

    expect(process.env['ENTRY2']).toEqual(undefined);
    expect(process.env['ENTRY3_ENTRY2']).toEqual(undefined);
    expect(process.env['ENTRY1']).toEqual('a');
  });

  it('should load in async non stric mode', async () => {
    await loadEnv({
      folder: fixtureFolder,
    });

    expect(process.env['CONFIG1_CONFIG_1']).toEqual('a');
    expect(process.env['CONFIG1_CONFIG_2']).toEqual('b');
    expect(process.env['CONFIG2_CONFIG_3']).toEqual('c');
    expect(process.env['CONFIG2_LEVEL_2_CONFIG_1']).toEqual('aa');
    expect(process.env['CONFIG2_LEVEL_2_CONFIG_2']).toEqual('bb');
  });

  it('should fail in async strict mode', async () => {
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
