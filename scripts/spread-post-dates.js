const API_URL = (process.env.API_URL || "http://localhost:8080/api").replace(/\/$/, "");
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const START_DATE = process.env.START_DATE || "2024-07-01";

if (!ADMIN_PASSWORD) {
  console.error("Missing ADMIN_PASSWORD environment variable.");
  process.exit(1);
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Request failed: ${response.status}`);
  }
  return data;
}

async function login() {
  const data = await requestJson(`${API_URL}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: ADMIN_PASSWORD }),
  });

  return data.data.token;
}

async function fetchAllPosts() {
  const all = [];
  let page = 0;
  let hasNext = true;

  while (hasNext) {
    const data = await requestJson(`${API_URL}/posts/all?page=${page}&size=200`);
    const pageData = data.data;
    all.push(...pageData.content);
    hasNext = !pageData.last;
    page += 1;
  }

  return all;
}

function toIsoLocal(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}`;
}

function buildPublishedDate(index) {
  const base = new Date(`${START_DATE}T09:00:00`);
  const daysOffset = index * 9 + (index % 4) * 2;
  const date = new Date(base.getTime() + daysOffset * 24 * 60 * 60 * 1000);
  return toIsoLocal(date);
}

async function updatePostDate(token, slug, publishedAt) {
  await requestJson(`${API_URL}/posts/${encodeURIComponent(slug)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      publish: true,
      publishedAt,
    }),
  });
}

async function spreadDates() {
  console.log(`Starting publishedAt spread from ${START_DATE}\n`);

  const token = await login();
  const posts = await fetchAllPosts();

  if (posts.length === 0) {
    console.log("No posts found.");
    return;
  }

  posts.sort((a, b) => a.slug.localeCompare(b.slug));

  let success = 0;
  let failed = 0;

  for (let i = 0; i < posts.length; i += 1) {
    const post = posts[i];
    const publishedAt = buildPublishedDate(i);

    process.stdout.write(`- ${post.slug} -> ${publishedAt} ... `);
    try {
      await updatePostDate(token, post.slug, publishedAt);
      success += 1;
      console.log("ok");
    } catch (error) {
      failed += 1;
      console.log(`failed (${error.message})`);
    }
  }

  console.log("\nDone");
  console.log(`updated: ${success}`);
  console.log(`failed: ${failed}`);
}

spreadDates().catch((error) => {
  console.error("Spread script failed:", error.message);
  process.exit(1);
});
