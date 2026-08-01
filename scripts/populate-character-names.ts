import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";

// Parse .env and .env.local connection strings
const envPath = path.join(process.cwd(), ".env");
const envLocalPath = path.join(process.cwd(), ".env.local");

const envConfig = fs.existsSync(envPath) ? dotenv.parse(fs.readFileSync(envPath)) : {};
const envLocalConfig = fs.existsSync(envLocalPath) ? dotenv.parse(fs.readFileSync(envLocalPath)) : {};

const urls = Array.from(new Set([
  envLocalConfig.DATABASE_URL || process.env.DATABASE_URL,
  envConfig.DATABASE_URL
].filter(Boolean))) as string[];

// Known name translation mapping dictionary (Vietnamese / Original Name -> { en, zh })
const NAME_MAP: Record<string, { en: string; zh: string }> = {
  "2B": { en: "2B", zh: "2B" },
  "Acheron": { en: "Acheron", zh: "黄泉" },
  "Ada Wong": { en: "Ada Wong", zh: "艾达·王" },
  "Aglaea": { en: "Aglaea", zh: "阿格莱雅" },
  "Ahri": { en: "Ahri", zh: "阿狸" },
  "Âm Thị Kiều": { en: "Yin Shiqiao", zh: "阴氏乔" },
  "An Trĩ": { en: "An Zhi", zh: "安稚" },
  "Aponia": { en: "Aponia", zh: "阿波尼亚" },
  "Asagi Aoi": { en: "Asagi Aoi", zh: "浅木葵" },
  "A Tiêu": { en: "Ah Xiao", zh: "阿肖" },
  "Bảo Nhi": { en: "Bao Nhi", zh: "宝儿" },
  "Black Swan": { en: "Black Swan", zh: "黑天鹅" },
  "Firefly": { en: "Firefly", zh: "流萤" },
  "Furina": { en: "Furina", zh: "芙宁娜" },
  "Ganyu": { en: "Ganyu", zh: "甘雨" },
  "Hoàng Dung": { en: "Huang Rong", zh: "黄蓉" },
  "Hu Tao": { en: "Hu Tao", zh: "胡桃" },
  "Kafka": { en: "Kafka", zh: "卡芙卡" },
  "Kafuru": { en: "Kafuru", zh: "华风流" },
  "Kurokawa Akane": { en: "Kurokawa Akane", zh: "黑川赤音" },
  "March 7th": { en: "March 7th", zh: "三月七" },
  "Raiden Shogun": { en: "Raiden Shogun", zh: "雷电将军" },
  "Ruan Mei": { en: "Ruan Mei", zh: "阮•梅" },
  "San Hồ": { en: "Coral", zh: "珊瑚" },
  "Shenhe": { en: "Shenhe", zh: "申鹤" },
  "Sparkle": { en: "Sparkle", zh: "花火" },
  "Tifa Lockhart": { en: "Tifa Lockhart", zh: "蒂法·洛克哈特" },
  "Tuyền": { en: "Tuyen", zh: "泉" },
  "Yae Miko": { en: "Yae Miko", zh: "八重神子" },
  "Yelan": { en: "Yelan", zh: "夜兰" },
  "Nezuko": { en: "Nezuko Kamado", zh: "灶门祢豆子" },
  "Kanao": { en: "Kanao Tsuyuri", zh: "栗花落香奈乎" },
  "Mitsuri": { en: "Mitsuri Kanroji", zh: "甘露寺蜜璃" },
  "Shinobu": { en: "Shinobu Kocho", zh: "蝴蝶忍" },
  "Yor Forger": { en: "Yor Forger", zh: "约尔·福杰" },
  "Makima": { en: "Makima", zh: "玛奇玛" },
  "Power": { en: "Power", zh: "帕瓦" },
  "Reze": { en: "Reze", zh: "蕾塞" },
  "Asuka": { en: "Asuka Langley", zh: "惣流·明日香·兰格雷" },
  "Rei": { en: "Rei Ayanami", zh: "绫波丽" },
  "Mari": { en: "Mari Makinami", zh: "真希波·玛丽" },
  "Keqing": { en: "Keqing", zh: "刻晴" },
  "Ningguang": { en: "Ningguang", zh: "凝光" },
  "Navia": { en: "Navia", zh: "娜维娅" },
  "Clorinde": { en: "Clorinde", zh: "克洛琳德" },
  "Arlecchino": { en: "Arlecchino", zh: "阿蕾奇诺" },
  "Robin": { en: "Robin", zh: "知更鸟" },
  "Topaz": { en: "Topaz", zh: "托帕" },
  "Jiaoqiu": { en: "Jiaoqiu", zh: "焦丘" },
  "Feixiao": { en: "Feixiao", zh: "飞霄" },
  "Lingsha": { en: "Lingsha", zh: "灵砂" },
  "Rappaf": { en: "Rappa", zh: "乱破" },
  "Rappa": { en: "Rappa", zh: "乱破" },
  "Yunli": { en: "Yunli", zh: "云璃" },
  "March 7th (Hunt)": { en: "March 7th (The Hunt)", zh: "三月七·巡猎" },
  "Himeko": { en: "Himeko", zh: "姬子" },
  "Bronya": { en: "Bronya", zh: "布洛妮娅" },
  "Seele": { en: "Seele", zh: "希儿" },
  "Silver Wolf": { en: "Silver Wolf", zh: "银狼" },
  "Tingyun": { en: "Tingyun", zh: "停云" },
  "Xueyi": { en: "Xueyi", zh: "雪衣" },
  "Hanya": { en: "Hanya", zh: "寒鸦" },
  "Qingque": { en: "Qingque", zh: "青雀" },
  "Fu Xuan": { en: "Fu Xuan", zh: "符玄" },
  "Bailu": { en: "Bailu", zh: "白露" },
  "Sushang": { en: "Sushang", zh: "素裳" },
  "Guinaifen": { en: "Guinaifen", zh: "桂乃芬" },
  "Elysia": { en: "Elysia", zh: "爱莉希雅" },
  "Mobius": { en: "Mobius", zh: "梅比乌斯" },
  "Eden": { en: "Eden", zh: "伊甸" },
  "Griseo": { en: "Griseo", zh: "格蕾修" },
  "Pardofelis": { en: "Pardofelis", zh: "帕朵菲莉斯" },
  "Vill-V": { en: "Vill-V", zh: "维尔薇" },
  "Kiana": { en: "Kiana Kaslana", zh: "琪亚娜·卡斯兰娜" },
  "Raiden Mei": { en: "Raiden Mei", zh: "雷电芽衣" },
  "Theresa": { en: "Theresa Apocalypse", zh: "德丽莎·阿波卡利斯" },
  "Dudu": { en: "Durandal", zh: "幽兰黛尔" },
  "Rita": { en: "Rita Rossweisse", zh: "丽塔·洛斯薇瑟" },
  "Senti": { en: "Herrscher of Sentience", zh: "识律" },
  "Prometheus": { en: "Prometheus", zh: "普罗米修斯" },
  "Misteln": { en: "Misteln", zh: "米丝特琳" },
  "Songque": { en: "Songque", zh: "松雀" },
  "Helia": { en: "Helia", zh: "赫丽娅" },
  "Coralie": { en: "Coralie", zh: "科拉莉" },
  "Senadina": { en: "Senadina", zh: "瑟莉斯" },
  "Thelema": { en: "Thelema", zh: "瑟莉亚" },
  "Lantern": { en: "Lantern", zh: "灯" },
  "Vân Vận": { en: "Yun Yun", zh: "云韵" },
  "Tử Nghiên": { en: "Zi Yan", zh: "紫妍" },
  "Tiểu Y Tiên": { en: "Little Fairy Doctor", zh: "小医仙" },
  "Thanh Tiên Tử": { en: "Qing Xianzi", zh: "青仙子" },
  "Thanh Lân": { en: "Qing Lin", zh: "青鳞" },
  "Tào Dĩnh": { en: "Cao Ying", zh: "曹颖" },
  "Phượng Thanh Nhi": { en: "Feng Qing'er", zh: "凤清儿" },
  "Phượng Hoàng": { en: "Fenghuang", zh: "凤凰" },
  "Nhã Phi": { en: "Ya Fei", zh: "雅妃" },
  "Mỹ Đỗ Toa": { en: "Medusa (Cai Lin)", zh: "美杜莎" },
  "Liễu Phi": { en: "Liu Fei", zh: "柳菲" },
  "Huyền Y": { en: "Xuan Yi", zh: "玄衣" },
  "Huân Nhi": { en: "Xun'er", zh: "薰儿" },
  "Hàn Tuyết": { en: "Han Xue", zh: "韩雪" },
  "Hàn Nguyệt": { en: "Han Yue", zh: "韩月" },
  "Đường Hỏa Nhi": { en: "Tang Huo'er", zh: "唐火儿" }
};

// Fallback helper to remove diacritics for English name fallback
function removeVietnameseDiacritics(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/Đ/g, "D")
    .replace(/đ/g, "d");
}

async function main() {
  if (urls.length === 0) {
    console.error("❌ DATABASE_URL is not set.");
    process.exit(1);
  }

  for (const url of urls) {
    console.log(`\n⏳ Processing database: ${url.substring(0, 35)}...`);
    const sql = neon(url);

    const rows = await sql.query(`SELECT id, name, name_en, name_zh FROM characters ORDER BY id DESC;`);
    console.log(`📋 Found ${rows.length} character records.`);

    let updatedCount = 0;
    for (const row of rows) {
      const name = row.name ? row.name.trim() : "";
      let en = row.name_en;
      let zh = row.name_zh;

      if (NAME_MAP[name]) {
        en = NAME_MAP[name].en;
        zh = NAME_MAP[name].zh;
      } else {
        // Fallback for nameEn & nameZh if not explicitly mapped
        if (!en) en = removeVietnameseDiacritics(name);
        if (!zh) zh = name; // default to original string if no Chinese translation available
      }

      await sql.query(
        `UPDATE characters SET name_en = $1, name_zh = $2 WHERE id = $3;`,
        [en, zh, row.id]
      );
      updatedCount++;
      console.log(`  [ID ${row.id}] ${name} -> EN: "${en}" | ZH: "${zh}"`);
    }

    console.log(`✅ Successfully updated ${updatedCount} characters on DB!`);
  }
}

main().catch(console.error);
