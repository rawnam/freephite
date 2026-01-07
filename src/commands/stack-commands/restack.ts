import yargs from 'yargs';
import { restackBranches } from '../../actions/restack';
import { SCOPE } from '../../lib/engine/scope_spec';
import { freephite } from '../../lib/runner';

const args = {
  branch: {
    describe: 'Which branch to run this command from (default: current branch)',
    type: 'string',
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const aliases = ['r', 'fix', 'f'];
export const command = 'restack';
export const canonical = 'stack restack';
export const description =
  'Ensure each branch in the current stack is based on its parent, rebasing if necessary.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> =>
  freephite(argv, canonical, async (context) => {
    return restackBranches(
      context.engine.getRelativeStack(
        argv.branch ?? context.engine.currentBranchPrecondition,
        SCOPE.STACK
      ),
      context
    );
  });
