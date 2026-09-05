import * as fs from "fs";
import * as path from "path";

const filePath = path.resolve(__dirname, "../app/admin/actions.ts");
let content = fs.readFileSync(filePath, "utf8");

// 1. Update the next/cache import to include unstable_cache
const importOld = 'import { revalidatePath, revalidateTag } from "next/cache";';
const importNew = `import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

function revalidateAdmin() {
  revalidateTag("admin-data", "default");
  revalidatePath("/");
}`;

if (content.includes(importOld)) {
  content = content.replace(importOld, importNew);
} else {
  console.log("Warning: next/cache import not found exactly.");
}

// 2. Replace revalidatePath calls
content = content.replace(/revalidatePath\("\/"\);/g, "revalidateAdmin();");
content = content.replace(/revalidatePath\("\/admin"\);/g, "revalidateAdmin();");

fs.writeFileSync(filePath, content, "utf8");
console.log("Updated actions.ts successfully.");
