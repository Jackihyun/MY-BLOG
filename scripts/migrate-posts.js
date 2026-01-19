/**
 * Post Migration Script
 *
 * This script migrates existing markdown posts from the file system to the database.
 *
 * Usage:
 * 1. Set up your environment variables (API URL and admin password)
 * 2. Run: node scripts/migrate-posts.js
 *
 * Environment variables required:
 * - API_URL: The backend API URL (e.g., http://localhost:8080/api)
 * - ADMIN_PASSWORD: The admin password for authentication
 */

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const API_URL = process.env.API_URL || "http://localhost:8080/api";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

const postsDirectory = path.join(process.cwd(), "src/posts");

async function login() {
  console.log("Logging in...");

  const response = await fetch(`${API_URL}/admin/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password: ADMIN_PASSWORD }),
  });

  if (!response.ok) {
    throw new Error("Login failed. Check your admin password.");
  }

  const data = await response.json();
  return data.data.token;
}

async function createPost(token, postData) {
  const response = await fetch(`${API_URL}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(postData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create post: ${error.message}`);
  }

  return response.json();
}

async function migrate() {
  console.log("Starting migration...\n");

  try {
    // Login to get token
    const token = await login();
    console.log("Login successful!\n");

    // Read all markdown files
    const fileNames = fs.readdirSync(postsDirectory);
    console.log(`Found ${fileNames.length} posts to migrate.\n`);

    let successCount = 0;
    let failCount = 0;

    for (const fileName of fileNames) {
      if (!fileName.endsWith(".md")) continue;

      const slug = fileName.replace(/\.md$/, "");
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const matterResult = matter(fileContents);

      const postData = {
        slug,
        title: matterResult.data.title || slug,
        content: matterResult.content,
        category: matterResult.data.category || "Uncategorized",
        excerpt: matterResult.data.excerpt || "",
        publish: true,
      };

      console.log(`Migrating: ${postData.title}`);

      try {
        await createPost(token, postData);
        console.log(`  ✓ Success\n`);
        successCount++;
      } catch (error) {
        console.log(`  ✗ Failed: ${error.message}\n`);
        failCount++;
      }
    }

    console.log("=====================================");
    console.log(`Migration complete!`);
    console.log(`  Success: ${successCount}`);
    console.log(`  Failed: ${failCount}`);
    console.log("=====================================");
  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exit(1);
  }
}

migrate();
