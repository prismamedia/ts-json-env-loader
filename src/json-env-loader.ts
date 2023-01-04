import * as fs from 'fs';
import * as path from 'path';

export type Config = {
  folder: string;
  include?: RegExp;
  exclude?: RegExp;
  /** throw an error if a file does not contain json */
  strict?: boolean;
};

type ParsedConfig = {
  folder: string;
  include: RegExp | null;
  exclude: RegExp | null;
  /** throw an error if a file does not contain json */
  strict: boolean;
};

export function loadEnvSync(config: Config) {
  const { folder, include, exclude, strict } = parseConfig(config);
  if (!fs.statSync(folder).isDirectory) {
    throw new Error('a path to an existing folder must be configured');
  }

  const files = fs.readdirSync(folder);
  files.map((filePath: string) => {
    const fileBaseName = path.basename(filePath);
    const fullFilePath = `${folder}/${filePath}`;

    if (
      (!include || include.test(fileBaseName)) &&
      !(exclude && exclude.test(fileBaseName))
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

      objectToEnv(json);
    }
  });
}

export async function loadEnv(config: Config) {
  const { folder, include, exclude, strict } = parseConfig(config);
  if (!(await fs.promises.stat(folder)).isDirectory) {
    throw new Error('a path to an existing folder must be configured');
  }

  const files = await fs.promises.readdir(folder);
  await Promise.all(
    files.map(async (filePath: string) => {
      const fileBaseName = path.basename(filePath);
      const fullFilePath = `${folder}/${filePath}`;
      if (
        (!include || include.test(fileBaseName)) &&
        !(exclude && exclude.test(fileBaseName))
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
        objectToEnv(json);
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
    include:
      config.include ||
      (process.env['JSONENVLOADER_CONFIG_INCLUDE']
        ? new RegExp(process.env['JSONENVLOADER_CONFIG_INCLUDE'] as string)
        : null),
    exclude:
      config.exclude ||
      (process.env['JSONENVLOADER_CONFIG_EXCLUDE']
        ? new RegExp(process.env['JSONENVLOADER_CONFIG_EXCLUDE'] as string)
        : null),
    strict:
      config.strict || Boolean(process.env['JSONENVLOADER_CONFIG_STRICT']),
  };
}

export function objectToEnv(parsed: any, prefix: string = '') {
  Object.entries(parsed).forEach(([key, value]) => {
    const prefixedKey = `${prefix}${key}`;
    if (typeof value === 'object') {
      objectToEnv(value, `${prefixedKey}_`);
    } else {
      if (!process.env.hasOwnProperty(prefixedKey)) {
        process.env[prefixedKey] = value as string;
      } else {
        throw new Error(`"${key}" is already defined in process.env`);
      }
    }
  });
}

export default {
  loadEnv,
  loadEnvSync,
};
