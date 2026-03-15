const fs = require("fs");
const path = require("path");

const API_URL = (process.env.API_URL || "http://localhost:8080/api").replace(/\/$/, "");
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const postsDirectory = path.join(__dirname, "..", "frontend", "src", "posts");
const DRY_RUN = process.env.DRY_RUN !== "false";

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

async function deletePost(token, slug) {
  await requestJson(`${API_URL}/posts/${encodeURIComponent(slug)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

function getLegacySlugs() {
  if (!fs.existsSync(postsDirectory)) {
    return new Set();
  }

  const fileNames = fs
    .readdirSync(postsDirectory)
    .filter((name) => name.endsWith(".md"));

  return new Set(fileNames.map((name) => name.replace(/\.md$/, "")));
}

async function run() {
  console.log("Deleting migrated markdown posts from DB\n");
  console.log(`API_URL: ${API_URL}`);
  console.log(`DRY_RUN: ${DRY_RUN ? "true" : "false"}\n`);

  const token = await login();
  const legacySlugs = getLegacySlugs();
  const allPosts = await fetchAllPosts();
  const targets = allPosts.filter((post) => legacySlugs.has(post.slug));

  if (targets.length === 0) {
    console.log("No migrated posts found in DB.");
    return;
  }

  console.log(`Found ${targets.length} migrated posts:`);
  targets.forEach((post) => console.log(`- ${post.slug}`));
  console.log("");

  if (DRY_RUN) {
    console.log("Dry run complete. Nothing deleted.");
    console.log("Set DRY_RUN=false to actually delete.");
    return;
  }

  let success = 0;
  let failed = 0;

  for (const post of targets) {
    process.stdout.write(`Deleting ${post.slug} ... `);
    try {
      await deletePost(token, post.slug);
      success += 1;
      console.log("ok");
    } catch (error) {
      failed += 1;
      console.log(`failed (${error.message})`);
    }
  }

  console.log("\nDone");
  console.log(`deleted: ${success}`);
  console.log(`failed: ${failed}`);
}

run().catch((error) => {
  console.error("Delete script failed:", error.message);
  process.exit(1);
});
