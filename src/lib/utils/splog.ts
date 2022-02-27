import chalk from 'chalk';
import { execStateConfig } from '../config';
import { TContext } from '../context/context';

export function logMessageFromGraphite(msg: string): void {
  console.log(chalk.yellow(msg) + '\n\n');
}

export function logError(msg: string): void {
  console.log(chalk.redBright(`ERROR: ${msg}`));
}

export function logWarn(msg: string): void {
  console.log(chalk.yellow(`WARNING: ${msg}`));
}

export function logInfo(msg: string): void {
  if (!execStateConfig.quiet()) {
    console.log(`${msg}`);
  }
}

export function logSuccess(msg: string): void {
  if (!execStateConfig.quiet()) {
    console.log(chalk.green(`${msg}`));
  }
}

export function logDebug(msg: string): void {
  if (execStateConfig.outputDebugLogs()) {
    console.log(msg);
  }
}
export function logTip(msg: string, context: TContext): void {
  if (!execStateConfig.quiet() && context.userConfig.data.tips) {
    console.log(
      chalk.gray(
        [
          '',
          `${chalk.bold('tip')}: ${msg}`,
          chalk.italic('Feeling expert? "gt user tips --disable"'),
        ].join('\n')
      )
    );
  }
}

export function logNewline(): void {
  if (!execStateConfig.quiet()) {
    console.log('');
  }
}
