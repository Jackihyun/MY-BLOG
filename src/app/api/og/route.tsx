import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "Jack's Blog";
  const category = searchParams.get("category") || "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://blog.jackihyun.me";
  const host = new URL(siteUrl).host;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0b1120",
          backgroundImage:
            "radial-gradient(circle at 12% 15%, #1d4ed8 0%, rgba(29, 78, 216, 0) 36%), radial-gradient(circle at 88% 18%, #0891b2 0%, rgba(8, 145, 178, 0) 32%), linear-gradient(145deg, #0b1120 0%, #111827 60%, #020617 100%)",
          padding: "40px 80px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            maxWidth: "900px",
          }}
        >
          {category && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "8px 24px",
                 backgroundColor: "rgba(59, 130, 246, 0.16)",
                 border: "1px solid rgba(125, 211, 252, 0.35)",
                 borderRadius: "24px",
                marginBottom: "24px",
              }}
            >
              <span
                style={{
                  fontSize: "24px",
                   color: "#bfdbfe",
                  fontWeight: 500,
                }}
              >
                {category}
              </span>
            </div>
          )}

          <h1
            style={{
              fontSize: title.length > 30 ? "48px" : "60px",
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.3,
              margin: 0,
              wordBreak: "keep-all",
            }}
          >
            {title}
          </h1>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: "48px",
              gap: "16px",
            }}
          >
            <div
              style={{
                 width: "54px",
                 height: "54px",
                 borderRadius: "14px",
                 background: "linear-gradient(160deg, #38bdf8, #2563eb)",
                 display: "flex",
                 alignItems: "center",
                 justifyContent: "center",
               }}
             >
               <span style={{ fontSize: "30px", color: "#fff", fontWeight: 700 }}>J</span>
             </div>
            <span
              style={{
                fontSize: "28px",
                 color: "#cbd5e1",
                 fontWeight: 500,
              }}
            >
              Jack&apos;s Blog
            </span>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "40px",
            right: "60px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span
            style={{
              fontSize: "20px",
               color: "#94a3b8",
             }}
           >
             {host}
           </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
