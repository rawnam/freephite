import fs from 'fs-extra';
import yargs from 'yargs';

import path from 'path';
import { freephiteWithoutRepo } from '../lib/runner';
const args = {} as const;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'changelog';
export const canonical = 'changelog';
export const aliases = ['changelog'];
export const description = 'Show the Freephite CLI changelog.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> =>
  freephiteWithoutRepo(argv, canonical, async (context) => {
    context.splog.page(
      fs.readFileSync(path.join(__dirname, '..', '..', '.CHANGELOG.md'), {
        encoding: 'utf-8',
      })
    );
  });
