/**
 * Materialized-path utilities for a key delegation tree (C046). A node's `path` is its keyIds root→…→self joined by "/".
 * That makes every chain/subtree question recursion-free: ancestors = the ids before self; descendants = a "/"-prefix
 * match. Pure — the app owns the storage; this owns the shape. Extracted verbatim from the source's key-lineage logic.
 */

/** A delegation chain can be at most this deep (root..leaf) — bounds the path length + the per-request walk. */
export const MAX_KEY_DEPTH = 8;

/** Escape SQL-LIKE metacharacters (a keyId can contain `_`, a LIKE wildcard) so a path prefix matches LITERALLY — pair
 *  with `ESCAPE '\'` in the query. Without this, a sibling whose id shares a `_`-adjacent prefix could leak into a
 *  subtree match. */
export const escapeLike = (s: string): string => s.replace(/[\\%_]/g, (c) => `\\${c}`);

/** The `LIKE` pattern for "<path>'s strict descendants" — pair with `ESCAPE '\'`. (The node itself is matched by `= path`.) */
export const subtreeLikePattern = (path: string): string => `${escapeLike(path)}/%`;

/** TRUE when `candidate` is within `path`'s subtree: the node itself (exact) OR a descendant (a "/"-prefix). The JS twin
 *  of the SQL subtree predicate — the single rule for spend pooling, log visibility, and cascade. */
export const inSubtree = (path: string, candidate: string): boolean => candidate === path || candidate.startsWith(path + "/");

/** A child's path = `parentPath/childId`, or the bare `childId` when the parent is a root (no path / a session caller). */
export const childPath = (parentPath: string | null | undefined, childId: string): string => (parentPath ? `${parentPath}/${childId}` : childId);

/** Depth of a path: 0 = root, >0 = a delegated child. */
export const pathDepth = (path: string): number => path.split("/").length - 1;

/** The ancestor keyIds in a path (everything before self), root→parent order. */
export const ancestorIdsOf = (path: string): string[] => path.split("/").slice(0, -1);

/** The own-path of the ancestor at index `i` in a path's segments (the prefix up to and including it). */
export const pathAt = (path: string, i: number): string => path.split("/").slice(0, i + 1).join("/");
