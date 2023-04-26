import * as fs from 'fs';
import * as path from 'path';

type onDuplicateEntryOptions = 'overwrite' | 'ignore' | 'throw';

export type Config = {
  folder: string;
  includeFolder?: RegExp;
  excludeFolder?: RegExp;
  includeEntry?: RegExp;
  excludeEntry?: RegExp;
  onDuplicateEntry?: onDuplicateEntryOptions;

  /** throw an error if a file does not contain json */
  strict?: boolean;
};

type ParsedConfig = {
  folder: string;
  includeFolder: RegExp | null;
  excludeFolder: RegExp | null;
  includeEntry: RegExp | null;
  excludeEntry: RegExp | null;
  onDuplicateEntry: 'overwrite' | 'ignore' | 'throw';
  /** throw an error if a file does not contain json */
  strict: boolean;
};

type ObjectToEnvConfig = {
  strict: boolean;
  includeEntry: RegExp | null;
  excludeEntry: RegExp | null;
  onDuplicateEntry: onDuplicateEntryOptions;
};

export function loadEnvSync(config: Config) {
  const {
    folder,
    includeFolder,
    excludeFolder,
    includeEntry,
    excludeEntry,
    strict,
    onDuplicateEntry,
  } = parseConfig(config);
  if (!fs.statSync(folder).isDirectory) {
    throw new Error('a path to an existing folder must be configured');
  }

  const files = fs.readdirSync(folder);
  files.map((filePath: string) => {
    const fileBaseName = path.basename(filePath);
    const fullFilePath = `${folder}/${filePath}`;

    if (
      (!includeFolder || includeFolder.test(fileBaseName)) &&
      !(excludeFolder && excludeFolder.test(fileBaseName))
    ) {
      let json = {};

      try {
        const parsedFile = JSON.parse(fs.readFileSync(fullFilePath, 'utf8'));
        if (parsedFile && typeof parsedFile === 'object') {
          json = parsedFile;
        } else if (strict) {
          throw new Error(`file ${fullFilePath} does not contain valid json`);
        }
      } catch (e) {
        if (strict) {
          throw new Error(`file ${fullFilePath} does not contain valid json`);
        }
      }

      objectToEnv(json, `${path.parse(fileBaseName).name}_`, {
        strict,
        includeEntry,
        excludeEntry,
        onDuplicateEntry,
      });
    }
  });
}

export async function loadEnv(config: Config) {
  const {
    folder,
    includeFolder,
    excludeFolder,
    includeEntry,
    excludeEntry,
    strict,
    onDuplicateEntry,
  } = parseConfig(config);
  if (!(await fs.promises.stat(folder)).isDirectory) {
    throw new Error('a path to an existing folder must be configured');
  }

  const files = await fs.promises.readdir(folder);
  await Promise.all(
    files.map(async (filePath: string) => {
      const fileBaseName = path.basename(filePath);
      const fullFilePath = `${folder}/${filePath}`;
      if (
        (!includeFolder || includeFolder.test(fileBaseName)) &&
        !(excludeFolder && excludeFolder.test(fileBaseName))
      ) {
        let json = {};
        try {
          const parsedFile = JSON.parse(
            await fs.promises.readFile(fullFilePath, 'utf8'),
          );
          if (parsedFile) {
            json = parsedFile;
          } else if (strict) {
            throw new Error(`file ${fullFilePath} does not contain valid json`);
          }
        } catch (e) {
          if (strict) {
            throw new Error(`file ${fullFilePath} does not contain valid json`);
          }
        }
        objectToEnv(json, `${path.parse(fileBaseName).name}_`, {
          strict,
          includeEntry,
          excludeEntry,
          onDuplicateEntry,
        });
      }
    }),
  );
}

function parseConfig(config: Config): ParsedConfig {
  const folder = config.folder || process.env['JSONENVLOADER_CONFIG_FOLDER'];

  if (!folder) {
    throw new Error(`folder path is required`);
  }

  return {
    folder,
    includeFolder:
      config.includeFolder ||
      (process.env['JSONENVLOADER_CONFIG_INCLUDE_FOLDER']
        ? new RegExp(
            process.env['JSONENVLOADER_CONFIG_INCLUDE_FOLDER'] as string,
          )
        : null),
    excludeFolder:
      config.excludeFolder ||
      (process.env['JSONENVLOADER_CONFIG_EXCLUDE_FOLDER']
        ? new RegExp(
            process.env['JSONENVLOADER_CONFIG_EXCLUDE_FOLDER'] as string,
          )
        : null),
    includeEntry:
      config.includeEntry ||
      (process.env['JSONENVLOADER_CONFIG_INCLUDE_ENTRY']
        ? new RegExp(
            process.env['JSONENVLOADER_CONFIG_INCLUDE_ENTRY'] as string,
          )
        : null),
    excludeEntry:
      config.excludeEntry ||
      (process.env['JSONENVLOADER_CONFIG_EXCLUDE_ENTRY']
        ? new RegExp(
            process.env['JSONENVLOADER_CONFIG_EXCLUDE_ENTRY'] as string,
          )
        : null),
    onDuplicateEntry:
      config.onDuplicateEntry ||
      (['overwrite', 'ignore', 'throw'].includes(
        process.env['JSONENVLOADER_CONFIG_EXCLUDE'] || '',
      )
        ? (process.env[
            'JSONENVLOADER_CONFIG_EXCLUDE'
          ] as onDuplicateEntryOptions)
        : 'ignore'),
    strict:
      config.strict || Boolean(process.env['JSONENVLOADER_CONFIG_STRICT']),
  };
}

export function objectToEnv(
  parsed: any,
  prefix: string = '',
  config: ObjectToEnvConfig,
) {
  const { strict, includeEntry, excludeEntry, onDuplicateEntry } = config;
  Object.entries(parsed).forEach(([key, value]) => {
    const prefixedKey = `${prefix}${key}`.toUpperCase();
    if (typeof value === 'object') {
      objectToEnv(value, `${prefixedKey}_`, config);
    } else {
      if (
        (!includeEntry || includeEntry.test(key)) &&
        !(excludeEntry && excludeEntry.test(key))
      ) {
        if (!process.env.hasOwnProperty(prefixedKey)) {
          process.env[prefixedKey] = value as string;
        } else {
          switch (onDuplicateEntry) {
            case 'ignore': // do nothing
              break;
            case 'overwrite':
              process.env[prefixedKey] = value as string;
              break;
            case 'throw':
              throw new Error(
                `"${prefixedKey}" is already defined in process.env`,
              );
          }
        }
      }
    }
  });
}
