"use client";

export function normalizeSearchQuery(query: string): string {
  return query.replace(/\s+/g, " ").trim();
}

export function hasMinimumSearchLength(query: string): boolean {
  return normalizeSearchQuery(query).length >= 2;
}

export function hasSearchableCharacters(query: string): boolean {
  const normalized = normalizeSearchQuery(query);
  return /[\p{L}\p{N}]/u.test(normalized);
}

export function canRunSearch(query: string): boolean {
  return hasMinimumSearchLength(query) && hasSearchableCharacters(query);
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
