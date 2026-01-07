import chalk from 'chalk';
import yargs from 'yargs';
import { freephiteWithoutRepo } from '../../lib/runner';

const args = {
  set: {
    demandOption: false,
    type: 'string',
    describe: 'Set default pager for Freephite. e.g. --set "less -FRX".',
  },
  disable: {
    demandOption: false,
    default: false,
    type: 'boolean',
    describe: 'Disable pager for Freephite',
  },
  unset: {
    demandOption: false,
    default: false,
    type: 'boolean',
    describe: 'Unset default pager for Freephite and default to git pager.',
  },
} as const;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export const command = 'pager';
export const description = 'The pager opened by Freephite.';
export const canonical = 'user pager';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return freephiteWithoutRepo(argv, canonical, async (context) => {
    if (argv.disable) {
      context.userConfig.update((data) => (data.pager = ''));
      context.splog.info(`Pager disabled`);
    } else if (argv.set) {
      context.userConfig.update((data) => (data.pager = argv.set));
      context.splog.info(`Pager set to ${chalk.cyan(argv.set)}`);
    } else if (argv.unset) {
      context.userConfig.update((data) => (data.pager = undefined));
      const currentPager = context.userConfig.getPager();
      context.splog.info(
        `Pager preference erased. Defaulting to your git pager (currently ${
          currentPager ? chalk.cyan(currentPager) : 'disabled'
        })`
      );
    } else {
      const currentPager = context.userConfig.getPager();
      !currentPager
        ? context.splog.info(`Pager is disabled`)
        : context.userConfig.data.pager
        ? context.splog.info(chalk.cyan(context.userConfig.data.pager))
        : context.splog.info(
            `Pager is not set. Freephite will use your git pager (currently ${chalk.cyan(
              currentPager
            )})`
          );
    }
  });
};
