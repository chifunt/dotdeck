/**
 * @file UI utility helpers.
 * Currently just `cn()` – a Tailwind-friendly class-name merger.
 */

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge an arbitrary number of conditional class-name inputs.
 * Keeps the *last* conflict (tailwind-merge) while retaining truthy
 * non-conflicting classes (clsx).
 *
 * @param  {...import("clsx").ClassValue} inputs – Any valid clsx value.
 * @returns {string} Space-delimited class list.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
