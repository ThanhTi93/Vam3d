import "dotenv/config";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { DEFAULT_CATEGORIES } from "@/lib/categories";
import { eq, ilike, or } from "drizzle-orm";
import { slugify } from "@/lib/utils";

async function main() {
  if (!db) {
    console.error("❌ Không thể kết nối cơ sở dữ liệu");
    process.exit(1);
  }

  console.log("🚀 Bắt đầu cập nhật mô tả chuẩn SEO cho thể loại trong Database...\n");

  const dbCategories = await db.query.categories.findMany();
  console.log(`📌 Tìm thấy ${dbCategories.length} thể loại trong database.\n`);

  let updatedCount = 0;

  for (const defaultCat of DEFAULT_CATEGORIES) {
    // Find matching category in DB by name or slug
    const matchedDbCat = dbCategories.find(
      (c) =>
        c.name.trim().toLowerCase() === defaultCat.name.trim().toLowerCase() ||
        (c.slug && c.slug.trim().toLowerCase() === defaultCat.slug.trim().toLowerCase()) ||
        slugify(c.name).toLowerCase() === defaultCat.slug.toLowerCase()
    );

    if (matchedDbCat) {
      // Update description & slug
      await db
        .update(categories)
        .set({
          description: defaultCat.description,
          slug: matchedDbCat.slug || defaultCat.slug || slugify(matchedDbCat.name),
        })
        .where(eq(categories.id, matchedDbCat.id));

      console.log(`✅ [Đã cập nhật] ID: ${matchedDbCat.id} | ${matchedDbCat.name}`);
      console.log(`   📝 Mô tả SEO: "${defaultCat.description}"\n`);
      updatedCount++;
    } else {
      // If not exist, insert it
      const [inserted] = await db
        .insert(categories)
        .values({
          name: defaultCat.name,
          slug: defaultCat.slug,
          description: defaultCat.description,
          status: 1,
        })
        .returning();

      console.log(`➕ [Đã thêm mới] ID: ${inserted.id} | ${inserted.name}`);
      console.log(`   📝 Mô tả SEO: "${defaultCat.description}"\n`);
      updatedCount++;
    }
  }

  // Also check if any remaining DB categories need a generated SEO description
  for (const dbCat of dbCategories) {
    const isProcessed = DEFAULT_CATEGORIES.some(
      (c) =>
        c.name.trim().toLowerCase() === dbCat.name.trim().toLowerCase() ||
        (c.slug && c.slug.trim().toLowerCase() === (dbCat.slug || "").trim().toLowerCase())
    );

    if (!isProcessed && (!dbCat.description || dbCat.description.startsWith("Danh mục phim") || dbCat.description.length < 30)) {
      const generatedDesc = `Tuyển tập phim và nội dung ${dbCat.name} chất lượng cao Full HD / 4K Vietsub, cập nhật liên tục hàng ngày tại Vam3D.`;
      await db
        .update(categories)
        .set({
          description: generatedDesc,
          slug: dbCat.slug || slugify(dbCat.name),
        })
        .where(eq(categories.id, dbCat.id));

      console.log(`✨ [Đã chuẩn hóa SEO] ID: ${dbCat.id} | ${dbCat.name}`);
      console.log(`   📝 Mô tả: "${generatedDesc}"\n`);
      updatedCount++;
    }
  }

  console.log(`🎉 Hoàn tất! Đã cập nhật thành công ${updatedCount} thể loại trong database.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Lỗi khi cập nhật database:", err);
  process.exit(1);
});
