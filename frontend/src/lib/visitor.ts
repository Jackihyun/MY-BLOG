import { VisitTrackRequest } from "@/types";

function normalizeHost(hostname: string) {
  return hostname.replace(/^www\./, "").toLowerCase();
}

function classifySource(hostname: string) {
  const host = normalizeHost(hostname);

  if (!host) return "direct";
  if (host.includes("google.")) return "google";
  if (host.includes("naver.")) return "naver";
  if (host.includes("daum.") || host.includes("kakao.")) return "kakao";
  if (host.includes("bing.")) return "bing";
  if (host.includes("github.")) return "github";
  if (host.includes("linkedin.")) return "linkedin";
  if (host.includes("twitter.") || host.includes("x.com")) return "x";
  if (host.includes("openai.com") || host.includes("chatgpt.com")) return "chatgpt";
  if (host.includes("youtube.")) return "youtube";
  if (host.includes("velog.io")) return "velog";
  if (host.includes("tistory.com")) return "tistory";
  if (host.includes("brunch.co.kr")) return "brunch";

  return "referral";
}

export function buildVisitorTrackingPayload(clientId: string): VisitTrackRequest {
  const referrer = document.referrer;
  const landingPath = window.location.pathname || "/";

  if (!referrer) {
    return {
      clientId,
      source: "direct",
      referrerHost: "direct",
      landingPath,
    };
  }

  try {
    const referrerUrl = new URL(referrer);
    const currentHost = normalizeHost(window.location.hostname);
    const referrerHost = normalizeHost(referrerUrl.hostname);

    if (!referrerHost || referrerHost === currentHost) {
      return {
        clientId,
        source: "direct",
        referrerHost: "direct",
        landingPath,
      };
    }

    return {
      clientId,
      source: classifySource(referrerHost),
      referrerHost,
      landingPath,
    };
  } catch {
    return {
      clientId,
      source: "direct",
      referrerHost: "direct",
      landingPath,
    };
  }
}
