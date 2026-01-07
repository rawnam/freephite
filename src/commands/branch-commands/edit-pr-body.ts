import yargs from 'yargs';
import chalk from 'chalk';
import { editPRBody } from '../../actions/submit/pr_body';
import { submitPullRequest } from '../../actions/submit/submit_prs';
import { freephite } from '../../lib/runner';
import { ExitFailedError } from '../../lib/errors';

const args = {
  branch: {
    describe: `Branch to edit PR body for. Defaults to the current branch.`,
    demandOption: false,
    positional: true,
    type: 'string',
    hidden: true,
  },
} as const;

export const command = 'edit-pr-body [branch]';
export const description =
  'Edit the PR body for the current (or provided) branch using your configured editor.';
export const builder = args;
export const canonical = 'branch edit-pr-body';
export const aliases = ['epb'];

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const handler = async (argv: argsT): Promise<void> =>
  freephite(argv, canonical, async (context) => {
    const branchName = argv.branch || context.engine.currentBranch;

    if (!branchName) {
      throw new ExitFailedError(
        'No branch specified and not in a git repository.'
      );
    }

    // Check if branch exists
    if (!context.engine.allBranchNames.includes(branchName)) {
      throw new ExitFailedError(`Branch "${branchName}" does not exist.`);
    }

    // Get PR info for the branch
    const prInfo = context.engine.getPrInfo(branchName);
    if (!prInfo || !prInfo.number) {
      throw new ExitFailedError(
        `No PR found for branch "${branchName}". Make sure the branch has an associated pull request.`
      );
    }

    context.splog.info(
      `Editing PR body for ${chalk.cyan(branchName)} (PR #${prInfo.number})`
    );

    // Get current PR body or empty string if none
    const currentBody = prInfo.body || '';

    // Open editor to edit the body
    const newBody = await editPRBody(currentBody, context);

    // Check if body actually changed
    if (newBody.trim() === currentBody.trim()) {
      context.splog.info('PR body unchanged. No update needed.');
      return;
    }

    context.splog.info('Updating PR body...');

    // Update the PR via GitHub API
    await submitPullRequest(
      {
        submissionInfo: [
          {
            action: 'update',
            head: branchName,
            base: context.engine.getParentPrecondition(branchName),
            prNumber: prInfo.number,
            body: newBody,
          },
        ],
        mergeWhenReady: false,
        trunkBranchName: context.engine.trunk,
      },
      context
    );

    context.splog.info(
      `✅ Successfully updated PR body for ${chalk.cyan(branchName)}`
    );
  });
