"use client";

export function normalizeSearchQuery(query: string): string {
  return query.replace(/\s+/g, " ").trim();
}

export function hasMinimumSearchLength(query: string): boolean {
  return normalizeSearchQuery(query).length >= 2;
}

export function hasSearchableCharacters(query: string): boolean {
  const normalized = normalizeSearchQuery(query);
  return /[A-Za-z0-9가-힣]/.test(normalized);
}

export function canRunSearch(query: string): boolean {
  return hasMinimumSearchLength(query) && hasSearchableCharacters(query);
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
