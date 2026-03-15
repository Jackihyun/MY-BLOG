function escapeSvg(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeText(value?: string) {
  if (!value) return "";

  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/<[^>]*>?/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function extractPalette(seed: string) {
  const palettes = [
    ["#0f766e", "#14b8a6", "#99f6e4"],
    ["#1d4ed8", "#38bdf8", "#dbeafe"],
    ["#7c3aed", "#c084fc", "#f3e8ff"],
    ["#be123c", "#fb7185", "#ffe4e6"],
    ["#c2410c", "#fb923c", "#ffedd5"],
    ["#166534", "#4ade80", "#dcfce7"],
    ["#374151", "#9ca3af", "#f4f4f5"],
  ];

  return palettes[hashString(seed) % palettes.length];
}

export function extractFirstImageSrc(contentHtml?: string) {
  if (!contentHtml) return "";

  const imageMatch = contentHtml.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  return imageMatch?.[1]?.trim() ?? "";
}

export function buildGeneratedThumbnail(title: string, category?: string, excerpt?: string) {
  const [from, to, accent] = extractPalette(`${title}-${category ?? ""}`);
  const safeTitle = escapeSvg(title || "Untitled");
  const safeCategory = escapeSvg(category || "Post");
  const safeExcerpt = escapeSvg(
    sanitizeText(excerpt || "").slice(0, 90) || "Jack's Blog",
  );

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${from}" />
          <stop offset="55%" stop-color="${to}" />
          <stop offset="100%" stop-color="#09090b" />
        </linearGradient>
      </defs>
      <rect width="1200" height="630" rx="40" fill="url(#bg)" />
      <circle cx="1040" cy="110" r="120" fill="${accent}" fill-opacity="0.18" />
      <circle cx="160" cy="520" r="150" fill="${accent}" fill-opacity="0.12" />
      <rect x="84" y="76" width="180" height="44" rx="22" fill="rgba(255,255,255,0.16)" />
      <text x="174" y="104" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#ffffff">${safeCategory}</text>
      <text x="84" y="214" font-family="Arial, sans-serif" font-size="64" font-weight="800" fill="#ffffff">${safeTitle}</text>
      <text x="84" y="508" font-family="Arial, sans-serif" font-size="30" font-weight="500" fill="rgba(255,255,255,0.84)">${safeExcerpt}</text>
    </svg>
  `.replace(/\s{2,}/g, " ").trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function resolveThumbnail(options: {
  thumbnail?: string | null;
  contentHtml?: string;
  title: string;
  category?: string;
  excerpt?: string;
}) {
  const directThumbnail = options.thumbnail?.trim();
  if (directThumbnail) {
    return directThumbnail;
  }

  const firstImage = extractFirstImageSrc(options.contentHtml);
  if (firstImage) {
    return firstImage;
  }

  return buildGeneratedThumbnail(
    options.title,
    options.category,
    options.excerpt,
  );
}

export function toAbsoluteThumbnailUrl(url: string, siteUrl: string) {
  if (/^https?:\/\//i.test(url) || url.startsWith("data:")) {
    return url;
  }

  if (url.startsWith("/")) {
    return `${siteUrl.replace(/\/$/, "")}${url}`;
  }

  return `${siteUrl.replace(/\/$/, "")}/${url}`;
}
