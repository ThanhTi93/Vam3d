import postgres from "postgres";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

const envLocalPath = path.join(process.cwd(), ".env.local");
const envLocalConfig = fs.existsSync(envLocalPath) ? dotenv.parse(fs.readFileSync(envLocalPath)) : {};

const connectionString = envLocalConfig.DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error("Missing DATABASE_URL");
  process.exit(1);
}

const sql = postgres(connectionString);

async function main() {
  console.log("=== CHECKING TRAFFIC & ANALYTICS ===");

  // 1. Check total traffic logs and range of dates
  const totalLogs = await sql`
    SELECT 
      COUNT(*)::int as total,
      MIN(created_at) as earliest,
      MAX(created_at) as latest
    FROM traffic_logs;
  `;
  console.log("Total Traffic Logs:", totalLogs[0]);

  // 2. Traffic by day (last 14 days)
  const byDay = await sql`
    SELECT 
      TO_CHAR(created_at + INTERVAL '7 HOURS', 'YYYY-MM-DD') as day,
      COUNT(*)::int as total_clicks,
      COUNT(DISTINCT ip_hash)::int as unique_visitors,
      COUNT(CASE WHEN source = 'google' THEN 1 END)::int as google_clicks,
      COUNT(CASE WHEN device = 'mobile' OR device = 'tablet' THEN 1 END)::int as mobile_clicks,
      COUNT(CASE WHEN device = 'desktop' THEN 1 END)::int as desktop_clicks
    FROM traffic_logs
    GROUP BY 1
    ORDER BY 1 DESC
    LIMIT 20;
  `;
  console.log("\n--- Traffic by day (Vietnam time) ---");
  console.table(byDay);

  // 3. Traffic breakdown by source
  const bySource = await sql`
    SELECT 
      source,
      COUNT(*)::int as count,
      ROUND(COUNT(*)::numeric / NULLIF((SELECT COUNT(*) FROM traffic_logs), 0) * 100, 2) as percentage
    FROM traffic_logs
    GROUP BY 1
    ORDER BY count DESC;
  `;
  console.log("\n--- Traffic by Source ---");
  console.table(bySource);

  // 4. Traffic breakdown by device
  const byDevice = await sql`
    SELECT 
      device,
      COUNT(*)::int as count,
      ROUND(COUNT(*)::numeric / NULLIF((SELECT COUNT(*) FROM traffic_logs), 0) * 100, 2) as percentage
    FROM traffic_logs
    GROUP BY 1
    ORDER BY count DESC;
  `;
  console.log("\n--- Traffic by Device ---");
  console.table(byDevice);

  // Top visited pages
  const topPages = await sql`
    SELECT 
      path,
      MAX(title) as title,
      COUNT(*)::int as visits,
      COUNT(CASE WHEN source = 'google' THEN 1 END)::int as google_visits
    FROM traffic_logs
    GROUP BY path
    ORDER BY visits DESC
    LIMIT 10;
  `;
  console.log("\n--- Top Visited Pages ---");
  console.table(topPages);

  // 5. Total episode views & top viewed episodes
  const episodeStats = await sql`
    SELECT 
      SUM(views)::int as total_episode_views,
      AVG(views)::numeric(10,2) as avg_views,
      MAX(views)::int as max_views,
      COUNT(*)::int as total_episodes
    FROM episodes;
  `;
  console.log("\n--- Episode Views Summary ---");
  console.log(episodeStats[0]);

  // 6. Registered Accounts and Payments
  const accountStats = await sql`
    SELECT 
      COUNT(*)::int as total_accounts,
      COUNT(CASE WHEN level > 0 THEN 1 END)::int as vip_accounts
    FROM accounts;
  `;
  console.log("\n--- Account Stats ---");
  console.log(accountStats[0]);

  const paymentStats = await sql`
    SELECT 
      COUNT(*)::int as total_transactions,
      COUNT(CASE WHEN status = 'paid' THEN 1 END)::int as paid_transactions,
      COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0)::numeric as total_revenue
    FROM payments;
  `;
  console.log("\n--- Payment Stats ---");
  console.log(paymentStats[0]);

  await sql.end();
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
