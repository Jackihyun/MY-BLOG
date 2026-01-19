import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "Jack's Blog";
  const category = searchParams.get("category") || "";

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
          backgroundColor: "#1a1a2e",
          backgroundImage:
            "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
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
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: "24px",
                marginBottom: "24px",
              }}
            >
              <span
                style={{
                  fontSize: "24px",
                  color: "#a5b4fc",
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
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: "#4f46e5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: "24px", color: "#fff" }}>J</span>
            </div>
            <span
              style={{
                fontSize: "28px",
                color: "#94a3b8",
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
              color: "#64748b",
            }}
          >
            jackblog.com
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
