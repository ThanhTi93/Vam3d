import fs from "fs";

let content = fs.readFileSync("app/admin/actions.ts", "utf-8");

// Remove unstable_cache import
content = content.replace('import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";', 'import { revalidatePath, revalidateTag } from "next/cache";');

// Replace const getCached_XXX = unstable_cache(\n  async (...) => {\n ... },\n  [...],\n  { ... }\n);
// with const getCached_XXX = async (...) => {\n ... };

// Pattern 1: Simple regex to unwrap unstable_cache(async () => { ... }, [...], { ... })
// Let's replace getCached_ functions to be direct async functions:
content = content.replace(/const getCached_(\w+) = unstable_cache\(\s*async \((.*?)\) => \{([\s\S]*?)\},\s*\[.*?\](?:,\s*\{.*?\})?\s*\);/g, (match, funcName, params, body) => {
  return `const getCached_${funcName} = async (${params}) => {${body}};`;
});

// Also check getCachedAdminEpisodes:
content = content.replace(/const getCachedAdminEpisodes = unstable_cache\(\s*async \((.*?)\) => \{([\s\S]*?)\},\s*\[.*?\](?:,\s*\{.*?\})?\s*\);/g, (match, params, body) => {
  return `const getCachedAdminEpisodes = async (${params}) => {${body}};`;
});

// Also check any return unstable_cache in getGalleriesPaginated / getPublicGalleriesPaginated
content = content.replace(/return unstable_cache\(\s*async \(\) => \{([\s\S]*?)\},\s*\[.*?\](?:,\s*\{.*?\})?\s*\)\(\);/g, (match, body) => {
  return `return (async () => {${body}})();`;
});

fs.writeFileSync("app/admin/actions.ts", content, "utf-8");
console.log("Successfully cleaned app/admin/actions.ts");
