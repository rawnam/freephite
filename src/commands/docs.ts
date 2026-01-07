import open from 'open';
import yargs from 'yargs';
import { freephiteWithoutRepo } from '../lib/runner';
const args = {} as const;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

const DOCS_URL =
  'https://docs.freephite.dev/guides/freephite-cli/familiarizing-yourself-with-gt';
export const command = 'docs';
export const canonical = 'docs';
export const aliases = ['docs'];
export const description = 'Show the Freephite CLI docs.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> =>
  freephiteWithoutRepo(argv, canonical, async () => void open(DOCS_URL));
