import * as fs from "fs";
import * as path from "path";

const filePath = path.resolve(__dirname, "../app/admin/actions.ts");
let content = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");

// A function to extract a block starting at index and find its matching closing brace
function findMatchingBraceBlock(str: string, startKey: string) {
  const startIndex = str.indexOf(startKey);
  if (startIndex === -1) return null;
  
  let braceCount = 0;
  let inString = false;
  let stringChar = "";
  let i = startIndex;
  
  // Find the opening brace of the function body
  while (i < str.length && str[i] !== "{") {
    i++;
  }
  
  if (i >= str.length) return null;
  
  const bodyStartIndex = i;
  braceCount = 1;
  i++;
  
  while (i < str.length && braceCount > 0) {
    const char = str[i];
    
    // Handle string literals to avoid counting braces inside strings
    if ((char === '"' || char === "'" || char === "`") && str[i-1] !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
    }
    
    if (!inString) {
      if (char === "{") {
        braceCount++;
      } else if (char === "}") {
        braceCount--;
      }
    }
    i++;
  }
  
  if (braceCount === 0) {
    return {
      start: startIndex,
      end: i,
      header: str.substring(startIndex, bodyStartIndex).trim(),
      body: str.substring(bodyStartIndex + 1, i - 1).trim()
    };
  }
  return null;
}

function wrapNoArgQuery(funcName: string, cacheKey: string, revalTag: string) {
  const block = findMatchingBraceBlock(content, `export async function ${funcName}()`);
  if (!block) {
    console.log(`Failed to find ${funcName}`);
    return;
  }
  
  // Extract body and strip "await verifyAdmin();" and "if (!db) return [];" if any
  let body = block.body;
  body = body.replace(/await verifyAdmin\(\);?/g, "").trim();
  
  const replacement = `const getCached_${funcName} = unstable_cache(
  async () => {
    ${body}
  },
  ["${cacheKey}"],
  { revalidate: 3600, tags: ["admin-data", "${cacheKey}", "${revalTag}"] }
);

export async function ${funcName}() {
  await verifyAdmin();
  return getCached_${funcName}();
}`;

  content = content.replace(content.substring(block.start, block.end), replacement);
  console.log(`Successfully wrapped ${funcName}`);
}

function wrapEpisodesQuery() {
  const block = findMatchingBraceBlock(content, `export async function getAdminEpisodes(movieId?: number)`);
  if (!block) {
    console.log(`Failed to find getAdminEpisodes`);
    return;
  }
  
  const replacement = `const getCachedAdminEpisodes = unstable_cache(
  async (movieId?: number) => {
    if (!db) return [];
    if (movieId) {
      return db.query.episodes.findMany({
        where: (ep, { eq }) => eq(ep.idMovie, movieId),
        orderBy: (ep, { asc }) => [asc(ep.id)],
        with: {
          episodesActors: { columns: { idActor: true } },
          episodesCharacters: { columns: { idCharacter: true } },
        }
      });
    }
    return db.query.episodes.findMany({
      orderBy: (ep, { asc }) => [asc(ep.id)],
      with: {
        movie: { columns: { id: true, name: true } },
        episodesActors: { columns: { idActor: true } },
        episodesCharacters: { columns: { idCharacter: true } },
      },
    });
  },
  ["admin-episodes"],
  { revalidate: 3600, tags: ["admin-data", "admin-episodes", "episodes"] }
);

export async function getAdminEpisodes(movieId?: number) {
  await verifyAdmin();
  if (!db) return [];
  await syncProcessingEpisodes();
  return getCachedAdminEpisodes(movieId);
}`;

  content = content.replace(content.substring(block.start, block.end), replacement);
  console.log(`Successfully wrapped getAdminEpisodes`);
}

// Wrap all 13 query functions
wrapNoArgQuery("getAdminMovies", "admin-movies", "movies");
wrapNoArgQuery("getAdminCategories", "admin-categories", "categories");
wrapEpisodesQuery();
wrapNoArgQuery("getAdminActors", "admin-actors", "actors");
wrapNoArgQuery("getAdminCharacters", "admin-characters", "characters");
wrapNoArgQuery("getAdminPlans", "admin-plans", "plans");
wrapNoArgQuery("getAdminFeatures", "admin-features", "features");
wrapNoArgQuery("getAdminPackages", "admin-packages", "packages");
wrapNoArgQuery("getAdminAuthors", "admin-authors", "authors");
wrapNoArgQuery("getAdminAccounts", "admin-accounts", "accounts");
wrapNoArgQuery("getAdminGalleries", "admin-galleries", "galleries");
wrapNoArgQuery("getAdminCollections", "admin-collections", "collections");
wrapNoArgQuery("getAdminAiImages", "admin-ai-images", "ai-images");

fs.writeFileSync(filePath, content, "utf8");
console.log("Completed query wrapping.");
