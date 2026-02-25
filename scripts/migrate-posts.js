const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const API_URL = (process.env.API_URL || "http://localhost:8080/api").replace(/\/$/, "");
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const postsDirectory = path.join(process.cwd(), "src/posts");

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

async function fetchExistingPost(token, slug) {
  const response = await fetch(`${API_URL}/posts/${encodeURIComponent(slug)}/admin`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Failed to fetch existing post: ${response.status}`);
  }

  const data = await response.json();
  return data.data;
}

async function createOrUpdatePost(token, postData) {
  const existing = await fetchExistingPost(token, postData.slug);
  const method = existing ? "PUT" : "POST";
  const endpoint = existing
    ? `${API_URL}/posts/${encodeURIComponent(postData.slug)}`
    : `${API_URL}/posts`;

  await requestJson(endpoint, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(postData),
  });

  return existing ? "updated" : "created";
}

async function migrate() {
  console.log("Starting markdown -> DB migration\n");

  const token = await login();
  console.log("Admin login success\n");

  const fileNames = fs
    .readdirSync(postsDirectory)
    .filter((name) => name.endsWith(".md"));

  console.log(`Found ${fileNames.length} markdown posts\n`);

  let created = 0;
  let updated = 0;
  let failed = 0;

  for (const fileName of fileNames) {
    const slug = fileName.replace(/\.md$/, "");
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const matterResult = matter(fileContents);

    const postData = {
      slug,
      title: matterResult.data.title || slug,
      content: matterResult.content,
      category: matterResult.data.category || "Uncategorized",
      excerpt: matterResult.data.excerpt || undefined,
      publish: true,
    };

    process.stdout.write(`- ${postData.title} ... `);

    try {
      const mode = await createOrUpdatePost(token, postData);
      if (mode === "created") created += 1;
      if (mode === "updated") updated += 1;
      console.log(mode);
    } catch (error) {
      failed += 1;
      console.log(`failed (${error.message})`);
    }
  }

  console.log("\nMigration complete");
  console.log(`created: ${created}`);
  console.log(`updated: ${updated}`);
  console.log(`failed: ${failed}`);
}

migrate().catch((error) => {
  console.error("Migration failed:", error.message);
  process.exit(1);
});
