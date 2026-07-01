import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import * as fs from "fs";

// Load local files manually to get all possible database URLs
function getUrls() {
  const urls: string[] = [];
  
  if (fs.existsSync(".env")) {
    const content = fs.readFileSync(".env", "utf8");
    const match = content.match(/DATABASE_URL\s*=\s*([^\s#]+)/);
    if (match) urls.push(match[1]);
  }
  
  if (fs.existsSync(".env.local")) {
    const content = fs.readFileSync(".env.local", "utf8");
    const match = content.match(/DATABASE_URL\s*=\s*([^\s#]+)/);
    if (match) urls.push(match[1]);
  }
  
  return Array.from(new Set(urls));
}

async function run() {
  const urls = getUrls();
  console.log("Found database URLs to check:", urls);
  
  for (const url of urls) {
    console.log(`\n--------------------------------------------`);
    console.log(`Connecting to: ${url.split("@")[1].split("/")[0]}`);
    try {
      const sql = neon(url);
      const res = await sql`SELECT id, username, email, role FROM accounts`;
      console.log("Current accounts:", res);
      
      if (res.length > 0) {
        await sql`UPDATE accounts SET role = 'admin'`;
        console.log("Updated all accounts to admin role successfully.");
        const updated = await sql`SELECT id, username, email, role FROM accounts`;
        console.log("Updated accounts:", updated);
      } else {
        console.log("No accounts found in this database.");
      }
    } catch (err: any) {
      console.error("Error for this database:", err.message);
    }
  }
}

run();
