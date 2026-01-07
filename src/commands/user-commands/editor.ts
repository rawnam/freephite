import chalk from 'chalk';
import yargs from 'yargs';
import { freephiteWithoutRepo } from '../../lib/runner';

const args = {
  set: {
    demandOption: false,
    default: '',
    type: 'string',
    describe: 'Set default editor for Freephite. eg --set vim.',
  },
  unset: {
    demandOption: false,
    default: false,
    type: 'boolean',
    describe: 'Unset default editor for Freephite.',
  },
} as const;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export const command = 'editor';
export const description = 'The editor opened by Freephite.';
export const canonical = 'user editor';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return freephiteWithoutRepo(argv, canonical, async (context) => {
    if (argv.set) {
      context.userConfig.update((data) => (data.editor = argv.set));
      context.splog.info(`Editor set to ${chalk.cyan(argv.set)}`);
    } else if (argv.unset) {
      context.userConfig.update((data) => (data.editor = undefined));
      context.splog.info(
        `Editor preference erased. Defaulting to your git editor (currently ${chalk.cyan(
          context.userConfig.getEditor()
        )})`
      );
    } else {
      context.userConfig.data.editor
        ? context.splog.info(chalk.cyan(context.userConfig.data.editor))
        : context.splog.info(
            `Editor is not set. Freephite will use your git editor (currently ${chalk.cyan(
              context.userConfig.getEditor()
            )})`
          );
    }
  });
};
