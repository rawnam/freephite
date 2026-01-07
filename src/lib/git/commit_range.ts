import {
  runAsyncGitCommand,
  runAsyncGitCommandAndSplitLines,
  runGitCommand,
  runGitCommandAndSplitLines,
} from './runner';

// NUL byte for splitting output (git outputs this when we use %x00 in format)
const RECORD_SEPARATOR = '\x00';

const FORMAT = {
  READABLE: '%h - %s',
  SUBJECT: '%s',
  MESSAGE: '%B',
  COMMITTER_DATE: '%cr',
  SHA: '%H',
} as const;
export type TCommitFormat = keyof typeof FORMAT;

// Formats that can contain newlines and need record separator handling
const MULTILINE_FORMATS: TCommitFormat[] = ['MESSAGE'];

/**
 * Get commits in a range with specified format.
 * Optimized: single git call instead of N+1 calls.
 */
export function getCommitRange(
  base: string | undefined,
  head: string,
  format: TCommitFormat
): string[] {
  const isMultiline = MULTILINE_FORMATS.includes(format);
  // Use %x00 in the format string - git interprets this as a NUL byte in output
  const formatStr = isMultiline
    ? `${FORMAT[format]}%x00`
    : FORMAT[format];

  if (isMultiline) {
    // For multi-line formats, use record separator and split manually
    const result = runGitCommand({
      args: [
        `--no-pager`,
        `log`,
        `--pretty=format:${formatStr}`,
        base ? `${base}..${head}` : `-1`,
        ...(base ? [] : [head]),
      ],
      onError: 'throw',
      resource: 'getCommitRange',
    });
    return result
      .split(RECORD_SEPARATOR)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  // For single-line formats, split on newlines
  return runGitCommandAndSplitLines({
    args: [
      `--no-pager`,
      `log`,
      `--pretty=format:${formatStr}`,
      base ? `${base}..${head}` : `-1`,
      ...(base ? [] : [head]),
    ],
    onError: 'throw',
    resource: 'getCommitRange',
  });
}

/**
 * Async version of getCommitRange.
 * Optimized: single git call instead of N+1 calls.
 */
export async function getCommitRangeAsync(
  base: string | undefined,
  head: string,
  format: TCommitFormat
): Promise<string[]> {
  const isMultiline = MULTILINE_FORMATS.includes(format);
  // Use %x00 in the format string - git interprets this as a NUL byte in output
  const formatStr = isMultiline
    ? `${FORMAT[format]}%x00`
    : FORMAT[format];

  if (isMultiline) {
    // For multi-line formats, use record separator and split manually
    const result = await runAsyncGitCommand({
      args: [
        `--no-pager`,
        `log`,
        `--pretty=format:${formatStr}`,
        base ? `${base}..${head}` : `-1`,
        ...(base ? [] : [head]),
      ],
      onError: 'throw',
      resource: 'getCommitRange',
    });
    return result
      .split(RECORD_SEPARATOR)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  // For single-line formats, split on newlines
  return runAsyncGitCommandAndSplitLines({
    args: [
      `--no-pager`,
      `log`,
      `--pretty=format:${formatStr}`,
      base ? `${base}..${head}` : `-1`,
      ...(base ? [] : [head]),
    ],
    onError: 'throw',
    resource: 'getCommitRange',
  });
}
