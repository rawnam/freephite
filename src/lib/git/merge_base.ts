import { runAsyncGitCommand, runGitCommand } from './runner';

/**
 * Cache for merge-base results.
 * Only caches when BOTH arguments are SHAs (immutable), not branch names (mutable).
 * merge-base is commutative, so we normalize keys.
 */
const mergeBaseCache = new Map<string, string>();

// Match full 40-char SHA or abbreviated SHA (at least 7 chars)
const SHA_REGEX = /^[0-9a-f]{7,40}$/i;

function isSha(ref: string): boolean {
  return SHA_REGEX.test(ref);
}

function getCacheKey(left: string, right: string): string | null {
  // Only cache if both refs are SHAs - branch names can change their target
  if (!isSha(left) || !isSha(right)) {
    return null;
  }
  // Normalize key since merge-base(A, B) === merge-base(B, A)
  return left < right ? `${left}:${right}` : `${right}:${left}`;
}

export function getMergeBase(left: string, right: string): string {
  const key = getCacheKey(left, right);
  if (key !== null) {
    const cached = mergeBaseCache.get(key);
    if (cached !== undefined) {
      return cached;
    }
  }

  const result = runGitCommand({
    args: [`merge-base`, left, right],
    onError: 'throw',
    resource: 'getMergeBase',
  });

  if (key !== null) {
    mergeBaseCache.set(key, result);
  }
  return result;
}

export async function getMergeBaseAsync(
  left: string,
  right: string
): Promise<string> {
  const key = getCacheKey(left, right);
  if (key !== null) {
    const cached = mergeBaseCache.get(key);
    if (cached !== undefined) {
      return cached;
    }
  }

  const result = await runAsyncGitCommand({
    args: [`merge-base`, left, right],
    onError: 'throw',
    resource: 'getMergeBase',
  });

  if (key !== null) {
    mergeBaseCache.set(key, result);
  }
  return result;
}

/** Clear the merge-base cache. Call after operations that modify git history. */
export function clearMergeBaseCache(): void {
  mergeBaseCache.clear();
}
