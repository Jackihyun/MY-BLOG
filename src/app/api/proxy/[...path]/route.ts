import { NextRequest } from "next/server";

async function proxyHandler(request: NextRequest, { params }: { params: { path: string[] } }) {
  const targetBaseUrl =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    "http://localhost:8080/api";
  const path = params.path.join("/");
  const searchParams = request.nextUrl.search;
  const url = `${targetBaseUrl}/${path}${searchParams}`;

  // Clone headers
  const headers = new Headers(request.headers);
  // Remove problematic headers that cause CORS issues on the remote backend
  headers.delete("host");
  headers.delete("origin");
  headers.delete("referer");
  headers.delete("connection");
  headers.delete("transfer-encoding");
  headers.delete("content-length");

  try {
    const init: RequestInit = {
      method: request.method,
      headers,
    };

    // Forward body for non-GET/HEAD requests
    if (request.method !== "GET" && request.method !== "HEAD") {
      init.body = request.body;
      // @ts-ignore
      init.duplex = "half"; // Required for streaming request body in Node.js fetch
    }

    const response = await fetch(url, init);

    // Forward the response back to the client
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch (error) {
    console.error(`Proxy error for ${url}:`, error);
    return new Response(JSON.stringify({ message: "Proxy error connecting to backend" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export { proxyHandler as GET, proxyHandler as POST, proxyHandler as PUT, proxyHandler as DELETE, proxyHandler as PATCH };
