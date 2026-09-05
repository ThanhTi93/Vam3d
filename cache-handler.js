const Redis = require("ioredis");
const fs = require("fs");
const path = require("path");

const cacheDir = path.join(process.cwd(), ".next", "cache", "custom-redis-fallback");

try {
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
} catch (e) {
  //
}

let redis = null;

module.exports = class CacheHandler {
  constructor(options) {
    this.options = options;
  }

  async get(key) {
    // FileSystem cache read (Shared fallback for static prerendering workers)
    const filePath = path.join(cacheDir, `${key}.json`);
    try {
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const cacheEntry = JSON.parse(fileContent);
        
        console.log(`[DEBUG GET] key: ${key}, hasValue: ${!!cacheEntry.value}, kind: ${cacheEntry.value ? cacheEntry.value.kind : 'no-value'}, dataKeys: ${cacheEntry.value ? Object.keys(cacheEntry.value) : 'none'}`);
        
        return {
          lastModified: cacheEntry.lastModified || 17123456789,
          value: cacheEntry.value
        };
      }
    } catch (err) {
      //
    }
    
    console.log(`[DEBUG GET MISS] key: ${key}`);
    return undefined;
  }

  async set(key, data, ctx) {
    const tags = ctx.tags || [];
    const ttl = ctx.revalidate; // seconds

    console.log(`[DEBUG SET] key: ${key}, dataKind: ${data ? data.kind : 'no-data'}, dataKeys: ${data ? Object.keys(data) : 'none'}, ctx: ${JSON.stringify(ctx)}`);

    const cacheEntry = {
      lastModified: Date.now(),
      value: data
    };

    // FileSystem cache write
    const filePath = path.join(cacheDir, `${key}.json`);
    const expireAt = typeof ttl === "number" && ttl > 0 ? Date.now() + (ttl * 1000) : null;
    const fileEntry = {
      ...cacheEntry,
      expireAt,
      tags
    };

    try {
      fs.writeFileSync(filePath, JSON.stringify(fileEntry), "utf-8");
    } catch (err) {
      console.warn("Failed to write fallback cache file:", err.message);
    }
  }

  async revalidateTag(tags) {
    const tagArray = Array.isArray(tags) ? tags : [tags];
    try {
      if (fs.existsSync(cacheDir)) {
        const files = fs.readdirSync(cacheDir);
        for (const file of files) {
          if (file.endsWith(".json")) {
            const filePath = path.join(cacheDir, file);
            const fileContent = fs.readFileSync(filePath, "utf-8");
            const cacheEntry = JSON.parse(fileContent);
            const fileTags = cacheEntry.tags || [];
            
            const hasMatchingTag = tagArray.some(t => fileTags.includes(t));
            if (hasMatchingTag) {
              try {
                fs.unlinkSync(filePath);
              } catch (e) {}
            }
          }
        }
      }
    } catch (err) {
      //
    }
  }
};
