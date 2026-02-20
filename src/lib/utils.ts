import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const HTML_ENTITY_MAP: Record<string, string> = {
  "&nbsp;": " ",
  "&lt;": "<",
  "&gt;": ">",
  "&amp;": "&",
  "&quot;": '"',
  "&#39;": "'",
}

function decodeHtmlEntities(value: string): string {
  return value.replace(/&nbsp;|&lt;|&gt;|&amp;|&quot;|&#39;/g, (match) => HTML_ENTITY_MAP[match] ?? match)
}

export function toPlainText(value?: string | null): string {
  if (!value) return ""

  return decodeHtmlEntities(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export function getPostPreview(excerpt: string | undefined, contentHtml: string | undefined, maxLength: number): string {
  const cleanExcerpt = toPlainText(excerpt)
  const cleanContent = toPlainText(contentHtml)
  const base = cleanExcerpt || cleanContent

  if (!base) {
    return "요약이 아직 등록되지 않았습니다."
  }

  if (base.length <= maxLength) return base
  return `${base.slice(0, maxLength)}...`
}
