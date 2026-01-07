import chalk from 'chalk';
import { TContext } from '../lib/context';
import { NoFreephiteContinue, RebaseConflictError } from '../lib/errors';
import { clearContinuation, persistContinuation } from './persist_continuation';
import { printConflictStatus } from './print_conflict_status';
import { restackBranches } from './restack';
import { getBranchesFromRemote } from './sync/get';

export async function continueAction(
  opts: { addAll: boolean },
  context: TContext
): Promise<void> {
  if (!context.engine.rebaseInProgress()) {
    clearContinuation(context);
    throw new NoFreephiteContinue();
  }

  if (opts.addAll) {
    context.engine.addAll();
  }
  const rebasedBranchBase = context.continueConfig.data.rebasedBranchBase;
  const branchesToSync = context.continueConfig.data?.branchesToSync;
  const branchesToRestack = context.continueConfig.data?.branchesToRestack;

  if (!rebasedBranchBase) {
    clearContinuation(context);
    throw new NoFreephiteContinue('git rebase --continue');
  }

  const cont = context.engine.continueRebase(rebasedBranchBase);
  if (cont.result === 'REBASE_CONFLICT') {
    persistContinuation(
      { branchesToRestack: branchesToRestack, rebasedBranchBase },
      context
    );
    printConflictStatus(`Rebase conflict is not yet resolved.`, context);
    throw new RebaseConflictError();
  }

  context.splog.info(
    `Resolved rebase conflict for ${chalk.green(cont.branchName)}.`
  );

  if (branchesToSync) {
    await getBranchesFromRemote(
      {
        downstack: branchesToSync,
        base: context.engine.currentBranchPrecondition,
        force: false,
      },
      context
    );
  }

  if (branchesToRestack) {
    restackBranches(branchesToRestack, context);
  }
  clearContinuation(context);
}
