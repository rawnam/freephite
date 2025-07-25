import { version } from '../../package.json';
import { TContextLite } from '../lib/context';
import {
  messageConfigFactory,
  TMessageConfig,
} from '../lib/spiffy/upgrade_message_spf';
import { spawnDetached } from '../lib/utils/spawn';
import semver from 'semver';

function printAndClearOldMessage(context: TContextLite): void {
  const oldMessage = context.messageConfig.data.message;
  // "Since we fetch the message asynchronously and display it when the user runs their next Graphite command,
  // double-check before showing the message if the CLI is still an old version
  // (i.e. the user hasn't updated the CLI in the meantime)."
  if (oldMessage && version == oldMessage.cliVersion) {
    if (!process.env.GRAPHITE_INTERACTIVE) {
      context.splog.message(oldMessage.contents);
    }
    context.messageConfig.update((data) => (data.message = undefined));
  }
}
export function fetchUpgradePromptInBackground(context: TContextLite): void {
  printAndClearOldMessage(context);
  spawnDetached(__filename);
}

async function fetchUpgradePrompt(
  messageConfig: TMessageConfig
): Promise<void> {
  if (process.env.GRAPHITE_DISABLE_UPGRADE_PROMPT) {
    return;
  }
  try {
    const response = await fetch(
      'https://registry.npmjs.org/@rawnam/freephite-cli'
    ).then((r) => r.json());
    const latest = response['dist-tags']['latest'];

    if (semver.compare(latest, version) > 0) {
      messageConfig.update(
        (data) =>
          (data.message = {
            contents: `Current freephite version ${version} < ${latest}. To update:\nhttps://www.npmjs.com/package/@rawnam/freephite-cli`,
            cliVersion: version,
          })
      );
    } else {
      messageConfig.update((data) => (data.message = undefined));
    }
  } catch (err) {
    return;
  }
}

if (process.argv[1] === __filename) {
  void fetchUpgradePrompt(messageConfigFactory.load());
}
