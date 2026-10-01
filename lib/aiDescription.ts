/**
 * AI SEO Description Generator for Vam3D / RoPhim
 * Enhanced with Google Gemini AI & Top Performing Google Search Keywords
 */

import { callGeminiText, callGeminiJson, callOpenAiFallback } from "./gemini";
import { getCategoryDetails } from "./categories";
import { slugify } from "./utils";

export interface GenerateDescriptionParams {
  title: string;
  characterNames?: string[];
  movieName?: string;
  type?: "gallery" | "movie" | "character";
}

/**
 * Intelligent algorithmic synthesizer for Vietnamese SEO descriptions
 * Used when AI services are offline or keys are not provided.
 */
export function generateAlgorithmicSeoDescription({
  title,
  characterNames = [],
  movieName,
}: GenerateDescriptionParams): string {
  const cleanTitle = title.trim();
  const charListStr = characterNames.length > 0 ? characterNames.join(", ") : "";

  const openers = [
    `Khám phá trọn bộ ảnh sex 3D và bộ sưu tập AI ${cleanTitle} với độ phân giải siêu nét 4K tại Vam3D.`,
    `Chiêm ngưỡng vẻ đẹp quyến rũ đỉnh cao trong album ảnh AI Cosplay 18+ ${cleanTitle} độc quyền trên Vam3D Hentai.`,
    `Thưởng thức trọn bộ ảnh sex AI Vietsub ${cleanTitle}, tái hiện thần thái gợi cảm và mãn nhãn nhất chỉ có tại Vam 3D.`,
    `Bộ sưu tập ảnh AI ${cleanTitle} mang đến những thước hình 3D Anime, Hentai 3D Trung Quốc siêu sắc nét và lôi cuốn.`,
    `Tổng hợp kho ảnh AI sex 3D tuyệt mỹ trong bộ sưu tập ${cleanTitle}, tạo hình sống động và sắc nét từng chi tiết tại Vam3D.`,
  ];

  const middleSentences = [
    charListStr
      ? `Bộ ảnh tôn vinh trọn vẹn nét đẹp bốc lửa, kiêu sa của nhân vật ${charListStr}${movieName ? ` từ siêu phẩm ${movieName}` : ""}, mang lại trải nghiệm thị giác bùng nổ cho fan hoạt hình 3D.`
      : `Được tạo tác bằng công nghệ AI tiên tiến, từng bức ảnh mang đến góc nhìn chân thực, bốc lửa và đậm chất nghệ thuật 3D đỉnh cao.`,
    charListStr
      ? `Với tạo hình nóng bỏng của ${charListStr}, album mang đến những khung cảnh gợi cảm khó cưỡng cùng chất lượng hình ảnh Full HD / 4K không watermark.`
      : `Từng chi tiết phục trang, ánh sáng và đường cong đều đạt chuẩn 4K siêu mượt, thỏa mãn đam mê của mọi tín đồ yêu thích nghệ thuật ảnh AI và Hentai 3D.`,
    `Sự kết hợp hoàn hảo giữa phong cách anime 3D Trung Quốc sống động và công nghệ AI giúp bộ ảnh trở nên cuốn hút vượt bậc.`,
  ];

  const closers = [
    `Truy cập ngay Vam3D để xem và tải trọn bộ ảnh AI 18+ chất lượng cao miễn phí!`,
    `Khám phá thêm hàng ngàn bộ ảnh sex AI Vietsub và phim hoạt hình 3D thuyết minh đặc sắc tại Vam 3D.`,
    `Xem ngay album đầy đủ và cập nhật các bộ sưu tập ảnh AI Anime 3D mới nhất hàng ngày trên Vam3D.`,
    `Đừng bỏ lỡ trọn bộ ảnh độc quyền sắc nét không che – Trải nghiệm ngay trên Vam3D!`,
  ];

  const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  return `${randomItem(openers)} ${randomItem(middleSentences)} ${randomItem(closers)}`;
}

/**
 * Generates Gallery SEO Description using Google Gemini
 */
export async function generateAiSeoDescription(params: GenerateDescriptionParams): Promise<string> {
  const { title, characterNames = [], movieName } = params;

  if (!title || !title.trim()) {
    throw new Error("Tiêu đề không được để trống khi sinh mô tả.");
  }

  const charContext = characterNames.length > 0 ? `Nhân vật xuất hiện: ${characterNames.join(", ")}.` : "";
  const movieContext = movieName ? `Thuộc phim/tác phẩm: ${movieName}.` : "";

  const prompt = `Bạn là chuyên gia SEO Copywriter hàng đầu cho website hoạt hình 3D, Hentai 3D Trung Quốc & Ảnh Sex AI Vietsub - Vam3D (Vam 3D).
Hãy viết một đoạn mô tả (description) cực kỳ cuốn hút, hấp dẫn và tối ưu hóa SEO Google cho bộ sưu tập ảnh AI sau:

Tiêu đề bộ sưu tập: "${title.trim()}"
${charContext}
${movieContext}

🎯 Các từ khóa SEO mục tiêu cần lồng ghép tự nhiên (chọn 2-3 từ phù hợp nhất vào câu văn):
- "Vam3D", "Vam 3D", "Vam3D Hentai", "Sex AI Vietsub", "Ảnh sex 3D", "Hentai 3D Trung Quốc", "Cosplay 18+", "Phim sex 3D thuyết minh", "Ảnh AI 4K", "Vam Vietsub".

Yêu cầu chất lượng:
1. Độ dài: 2 đến 3 câu (từ 50 - 80 từ), giọng văn gợi cảm, thu hút, kích thích bấm xem ảnh ngay.
2. Nhấn mạnh chất lượng 4K / Full HD sắc nét, tạo hình nhân vật đẹp sống động, độc quyền tại Vam3D.
3. Câu kết chứa Call-To-Action (kêu gọi xem trọn bộ, tải ảnh không watermark).
4. CHỈ TRẢ VỀ DUY NHẤT ĐOẠN VĂN BẢN MÔ TẢ (không thêm tiêu đề, không bọc dấu ngoặc kép, không giải thích).`;

  // 1. Try Google Gemini API
  const geminiResult = await callGeminiText({
    prompt,
    temperature: 0.7,
    maxTokens: 250,
  });
  if (geminiResult) {
    return geminiResult.replace(/^["']|["']$/g, "").trim();
  }

  // 2. Try OpenAI API fallback
  const openAiResult = await callOpenAiFallback({
    prompt,
    systemInstruction:
      "Bạn là chuyên gia SEO & Copywriter cho website ảnh AI, 3D Anime, Hentai 3D Vam3D. Luôn trả lời bằng tiếng Việt hấp dẫn, chuẩn SEO.",
    temperature: 0.7,
    maxTokens: 250,
  });
  if (openAiResult) {
    return openAiResult.replace(/^["']|["']$/g, "").trim();
  }

  // 3. Fallback to smart algorithmic synthesizer
  return generateAlgorithmicSeoDescription(params);
}

/**
 * Generates Category SEO Description using Google Gemini
 */
export async function generateCategoryAiDescription(categoryName: string): Promise<string> {
  const cleanName = categoryName.trim();
  if (!cleanName) {
    throw new Error("Tên thể loại không được để trống.");
  }

  const prompt = `Bạn là chuyên gia SEO Content cho nền tảng xem phim hoạt hình 3D Donghua, 3D Anime và Ảnh AI - Vam3D.
Hãy viết một đoạn mô tả (description) chuẩn SEO Google thật hấp dẫn, chuyên nghiệp cho thể loại phim: "${cleanName}".

Yêu cầu:
1. Độ dài: 2 đến 3 câu (khoảng 50 - 75 từ).
2. Nêu bật đặc trưng, sức hút lôi cuốn của thể loại này đối với người yêu thích phim hoạt hình 3D.
3. Lồng ghép khéo léo các từ khóa: Vam3D, hoạt hình 3D, Full HD / 4K, Vietsub.
4. Kêu gọi người xem đón xem và theo dõi các bộ phim thuộc thể loại "${cleanName}" trên Vam3D.
5. CHỈ TRẢ VỀ DUY NHẤT ĐOẠN MÔ TẢ (không bọc ngoặc kép, không giải thích).`;

  // 1. Try Google Gemini API
  const geminiResult = await callGeminiText({
    prompt,
    temperature: 0.7,
    maxTokens: 200,
  });
  if (geminiResult) {
    return geminiResult.replace(/^["']|["']$/g, "").trim();
  }

  // 2. Try OpenAI API fallback
  const openAiResult = await callOpenAiFallback({
    prompt,
    systemInstruction: "Bạn là chuyên gia viết mô tả thể loại phim hoạt hình 3D chuẩn SEO cho Vam3D.",
    temperature: 0.7,
    maxTokens: 200,
  });
  if (openAiResult) {
    return openAiResult.replace(/^["']|["']$/g, "").trim();
  }

  // 3. Algorithmic fallback
  try {
    const details = getCategoryDetails(cleanName);
    if (details.description) return details.description;
  } catch {
    // Ignore error
  }

  return `Tuyển tập các tác phẩm hoạt hình 3D thể loại ${cleanName} đặc sắc nhất với chất lượng đồ họa đỉnh cao, vietsub Full HD và âm thanh sống động. Khám phá và thưởng thức ngay tại Vam3D.`;
}

/**
 * Generates Movie SEO Description using Google Gemini
 */
export async function generateMovieAiDescription(params: {
  name: string;
  categoryNames?: string[];
  authorName?: string;
}): Promise<string> {
  const { name, categoryNames = [], authorName } = params;
  const cleanName = name.trim();
  if (!cleanName) {
    throw new Error("Tên phim không được để trống.");
  }

  const catStr = categoryNames.length > 0 ? `Thể loại: ${categoryNames.join(", ")}.` : "";
  const authorStr = authorName ? `Tác giả/Studio: ${authorName}.` : "";

  const prompt = `Bạn là biên tập viên giới thiệu phim hoạt hình 3D Donghua, Anime và Game 3D cho website Vam3D.
Hãy viết một đoạn giới thiệu tóm tắt nội dung và mô tả chuẩn SEO hấp dẫn cho bộ phim sau:
- Tên phim: "${cleanName}"
${catStr}
${authorStr}

Yêu cầu:
1. Tóm tắt súc tích bối cảnh hoặc sức hút kịch tính của bộ phim hoạt hình 3D này.
2. Độ dài: 2 đến 3 câu văn (từ 50 - 80 từ), phong cách hào hứng, lôi cuốn, tạo sự tò mò kích thích người xem.
3. Lồng ghép từ khóa tự nhiên: Vam3D, hoạt hình 3D, Full HD / 4K Vietsub.
4. CHỈ TRẢ VỀ DUY NHẤT ĐOẠN VĂN BẢN MÔ TẢ PHIM (không tiêu đề, không bọc dấu ngoặc kép).`;

  // 1. Try Gemini
  const geminiResult = await callGeminiText({
    prompt,
    temperature: 0.7,
    maxTokens: 250,
  });
  if (geminiResult) {
    return geminiResult.replace(/^["']|["']$/g, "").trim();
  }

  // 2. Try OpenAI fallback
  const openAiResult = await callOpenAiFallback({
    prompt,
    systemInstruction: "Bạn là biên tập viên giới thiệu phim 3D chuyên nghiệp cho Vam3D.",
    temperature: 0.7,
    maxTokens: 250,
  });
  if (openAiResult) {
    return openAiResult.replace(/^["']|["']$/g, "").trim();
  }

  // 3. Smart algorithmic fallback
  const catText = categoryNames.length > 0 ? ` thuộc thể loại ${categoryNames.join(", ")}` : "";
  return `Theo dõi siêu phẩm hoạt hình 3D "${cleanName}"${catText} với kỹ xảo đồ họa mãn nhãn và cốt truyện lôi cuốn. Thưởng thức trọn bộ vietsub thuyết minh chất lượng Full HD / 4K siêu nét chỉ có tại Vam3D.`;
}

/**
 * Generates Author Description using Google Gemini
 */
export async function generateAuthorAiDescription(authorName: string): Promise<string> {
  const cleanName = authorName.trim();
  if (!cleanName) {
    throw new Error("Tên tác giả không được để trống.");
  }

  const prompt = `Bạn là chuyên gia thông tin tác giả/studio hoạt hình 3D Donghua & Anime 3D.
Hãy viết một đoạn giới thiệu ngắn chuẩn xác và ấn tượng cho tác giả / nhà sản xuất: "${cleanName}".

Yêu cầu:
1. Giới thiệu phong cách sáng tác, nét đặc trưng đồ họa 3D hoặc những tác phẩm tiêu biểu liên quan.
2. Độ dài: 2 câu (khoảng 40 - 60 từ), giọng văn trang trọng, tôn vinh nghệ thuật sáng tạo.
3. CHỈ TRẢ VỀ DUY NHẤT ĐOẠN VĂN BẢN GIỚI THIỆU (không bọc ngoặc kép).`;

  // 1. Try Gemini
  const geminiResult = await callGeminiText({
    prompt,
    temperature: 0.5,
    maxTokens: 180,
  });
  if (geminiResult) {
    return geminiResult.replace(/^["']|["']$/g, "").trim();
  }

  // 2. Try OpenAI fallback
  const openAiResult = await callOpenAiFallback({
    prompt,
    temperature: 0.5,
    maxTokens: 180,
  });
  if (openAiResult) {
    return openAiResult.replace(/^["']|["']$/g, "").trim();
  }

  return `${cleanName} là tác giả / đơn vị sáng tạo nổi bật trong giới hoạt hình 3D, ghi dấu ấn sâu đậm với phong cách tạo hình sống động và cốt truyện cuốn hút. Khám phá các tác phẩm đặc sắc của ${cleanName} trên Vam3D.`;
}

export interface GenerateGalleryGeminiParams {
  characterNames: string[];
  movieName?: string;
  existingTitles?: string[];
  currentTitle?: string;
}

export interface GalleryGeminiResult {
  title: string;
  slug: string;
  hotKeys: string[];
  description: string;
}

export const GALLERY_SEO_STYLES = [
  "Bikini 2 Mảnh Siêu Nhỏ & Đồ Bơi Bãi Biển – Đường cong rực lửa thiêu đốt ánh nhìn",
  "Nữ Hoàng / Nữ Đế Quyền Uy Tối Thượng – Thần thái kiêu sa, vương giả và ma mị xuất trần",
  "Đồ Ngủ Ren Mỏng Xuyên Thấu & Nội Y Phòng Ngủ – Khoảnh khắc riêng tư quyến rũ chết người",
  "Cận Cảnh Nghệ Thuật 3D Siêu Thực (Macro Body Focus) – Tôn vinh từng centimet da thịt và số đo 3 vòng",
  "Tắm Suối & Onsen Tiên Cảnh Ướt Át – Làn nước trong vắt bám chặt thân hình gợi cảm mê hoặc",
  "Chiến Y Bó Sát & Bodysuit Cơ Thể – Nữ chiến binh kiêu hùng với thân hình đồng hồ cát nghẹt thở",
  "Cosplay Hầu Gái Sexy (French Maid) – Tạp dề ren ngắn khiêu khích, phục vụ tận tình đầy kích thích",
  "Thỏ Ngọc Bunny Girl Gợi Tình – Trang phục da bóng latex, tất lưới đen và tai thỏ bốc lửa",
  "Y Tá & Bác Sĩ Quyến Rũ (Sexy Nurse) – Váy ngắn xẻ ngực sâu, chăm sóc đặc biệt ngọt ngào",
  "Nữ Sinh Học Đường & Đồng Phục JK – Áo trắng váy xếp ly siêu ngắn, nét ngây thơ kết hợp thân hình bốc lửa",
  "Sườn Xám (Cheongsam) Cách Điệu Xẻ Cao – Lụa ôm sát khoe trọn vòng eo con kiến và cặp chân dài miên man",
  "Ác Quỷ Succubus & Ma Nữ Hút Hồn – Sừng quỷ, cánh dơi và đôi mắt tím thôi miên trong đêm tối",
  "Thiên Thần Sa Ngã & Đôi Cánh Lông Vũ – Vẻ đẹp thánh thiện thuần khiết nhưng cám dỗ tột cùng",
  "Váy Cưới Cô Dâu Gợi Cảm (Sexy Bride) – Voan trắng mỏng manh, đêm tân hôn nồng nàn say đắm",
  "Cửu Vỹ Thiên Hồ (Hồ Ly 9 Đuôi) – Mị lực ma mị vô song, 9 đuôi bồng bềnh quấn quýt đắm say",
  "Nữ Thư Ký & Nữ Tổng Tài Công Sở (Office Lady) – Sơ mi trắng bung cúc, chân váy bút chì ôm sát gợi cảm",
  "Gyaru & Làn Da Nâu Rám Nắng (Sun-kissed Skin) – Phong cách da nâu hoang dã, săn chắc đầy năng lượng",
  "Gothic Lolita Bí Ẩn & Quý Tộc Ma Cà Rồng – Đầm đen ren huyền bí, nét ma mị quý phái hút hồn",
  "Gym & Yoga Thể Thao Năng Động (Fitness Girl) – Đồ tập ôm sát từng múi cơ, mồ hôi lấp lánh gợi tình",
  "Điệp Viên & Sát Thủ Bóng Đêm (Femme Fatale) – Đồ da đen tuyền ôm sát, ánh mắt sắc lạnh và thân hình bốc lửa",
  "Cổ Trang Tiên Hiệp & Kiếm Hiệp Xuất Trần – Y phục lụa cổ phong bay bổng, tiên nữ giáng trần tuyệt mỹ",
  "Nữ Thần Ai Cập / Ba Tư Huyền Bí – Y phục dát vàng lấp lánh, vũ điệu lắc hông nửa kín nửa hở mê hoặc",
  "Đầm Dạ Hội Dạ Tiệc Xẻ Lưng Trần – Xương quai xanh quyến rũ, rãnh ngực sâu thẳm kiêu sa lộng lẫy",
  "Ướt Mưa & Áo Sơ Mi Ướt Sũng (Wet Look) – Cơn mưa rào bất chợt làm áo mỏng dính sát vào từng đường cong",
  "Cyberpunk & Nữ Người Máy Neon (Android Waifu) – Vi mạch phát sáng, vẻ đẹp công nghệ sắc lạnh cắt xẻ táo bạo",
  "Võ Quán & Nữ Hiệp Gợi Cảm (Martial Arts Girl) – Đòn thế uyển chuyển, cặp đùi mật ong săn chắc quyến rũ",
  "Tắm Bồn Sủi Bọt & Rượu Vang Lãng Mạn – Bọt xà phòng trắng muốt che hờ hững đường cong nghẹt thở",
  "Nữ Cướp Biển & Thuyền Trưởng Ngạo Nghễ – Áo corset thắt eo con kiến, mũ lông vũ kiêu hãnh phong trần",
  "Nữ Thần Hy Lạp / La Mã Cổ Đại (Aphrodite) – Váy voan trắng thắt đai vàng, vẻ đẹp nữ thần tình yêu bất tử",
  "18+ Táo Bạo Không Che (Uncensored Hardcore Art) – Phá vỡ mọi giới hạn, phô diễn trọn vẹn nét đẹp gợi cảm không che"
];

/**
 * Truly generative Gemini AI Title, Hot Keys & SEO Description Generator for Galleries
 * Guarantees creative, diverse, and 100% non-duplicate content directly from Gemini AI
 */
export async function generateGalleryGeminiAi(params: GenerateGalleryGeminiParams): Promise<GalleryGeminiResult> {
  const { characterNames, movieName, existingTitles = [], currentTitle } = params;
  const charText = characterNames.length > 0 ? characterNames.join(", ") : "Mỹ nhân 3D";
  const movieContext = movieName ? ` thuộc tác phẩm "${movieName}"` : "";
  
  // Pick a random style angle from 30 styles to guarantee distinct creative direction on every click
  const randomStyle = GALLERY_SEO_STYLES[Math.floor(Math.random() * GALLERY_SEO_STYLES.length)];

  // Deduplicate and filter existing titles
  const allExisting = Array.from(new Set([...existingTitles, ...(currentTitle ? [currentTitle] : [])]))
    .filter(Boolean)
    .slice(0, 40);
  const existingListStr = allExisting.map(t => `- "${t}"`).join("\n");

  const regenerateDirective = currentTitle
    ? `\n⚠️ ĐẶC BIỆT CHÚ Ý (NGƯỜI DÙNG BẤM TẠO LẠI ĐỂ TÌM Ý TƯỞNG MỚI LẠ):
- Tiêu đề hiện tại đang có là: "${currentTitle}".
- BẠN BẮT BUỘC PHẢI THAY ĐỔI TOÀN DIỆN: Đổi cấu trúc câu, đổi từ ngữ mở đầu, đổi phong cách thần thái sang hướng khác hẳn (ví dụ: nếu trước đó là "Cosplay 18+..." thì lần này đổi sang "Bộ Ảnh Bikini...", "Tuyệt Sắc Nữ Vương...", "Đường Cong Nghẹt Thở...", "Khoảnh Khắc Táo Bạo...", "Ren Mỏng Phòng Ngủ..."). Tuyệt đối không dập khuôn theo tiêu đề cũ!`
    : "";

  const prompt = `Bạn là Trí tuệ Nhân tạo Google Gemini - Giám đốc Sáng tạo và chuyên gia SEO số 1 cho nền tảng Ảnh AI 3D, Cosplay 18+, Donghua Waifu - Vam3D (Vam 3D).

Thông tin yêu cầu tạo bộ sưu tập:
- Nhân vật: ${charText}
${movieContext}
- Hướng phong cách nghệ thuật gợi ý cho lần tạo này: ${randomStyle}
${regenerateDirective}

🎯 NHIỆM VỤ CỦA BẠN LÀ TỰ DO SÁNG TẠO NỘI DUNG ĐỘC NHẤT (KHÔNG DẬP KHUÔN, KHÔNG GHÉP TỪ MÁY MÓC):
1. "title": Hãy thỏa sức sáng tạo một Tiêu đề Bộ sưu tập ảnh AI cực kỳ cuốn hút, giật tít thị giác mạnh mẽ, tôn vinh thần thái nhân vật ${charText} theo hướng phong cách "${randomStyle}".
- Đa dạng hóa linh hoạt cấu trúc tiêu đề: có thể bắt đầu bằng tên nhân vật, hoặc bằng tính từ/chủ đề giật tít (vd: "Tuyệt Sắc...", "Bikini Siêu Nóng Bỏng...", "Đường Cong...", "Khoảnh Khắc...", "Ren Mỏng...", "[Tên Nhân Vật] – Nữ Đế...", v.v.).
- Khéo léo chứa các từ khóa SEO đắt giá (như Cosplay 18+, Ảnh Sex AI 3D, 4K, Waifu Gợi Cảm, Không Che, Nữ Đế, Bikini...) và kết thúc bằng hậu tố thương hiệu Vam3D.
- ⚠️ QUY TẮC SỐNG CÒN: Tiêu đề TUYỆT ĐỐI KHÔNG ĐƯỢC TRÙNG HOẶC TƯƠNG TỰ CẤU TRÚC với các tiêu đề đã có sau đây:
${existingListStr || "(Chưa có tiêu đề trùng lặp)"}

2. "slug": Đường dẫn URL không dấu chuẩn SEO tương ứng.

3. "hotKeys": Mảng từ 25 đến 30 từ khóa hot search thực tế chuẩn SEO (Google Trends, Ahrefs, tìm kiếm phổ biến nhất) bao quát:
- Tên nhân vật, phim, phiên âm (vd: "${charText}", "${charText} 3D", "${charText} cosplay", "${movieName || 'hoạt hình 3D'}", v.v.)
- Từ khóa định dạng & độ phân giải (vd: "4K", "Full HD", "siêu nét", "không watermark", "không che", "uncensored")
- Từ khóa thể loại hot (vd: "Cosplay 18+", "Ảnh Sex AI 3D", "Waifu gợi cảm", "Donghua 18+", "Hentai 3D Trung Quốc", "Sex AI Vietsub", "Mỹ nhân 3D", "Ngự tỷ", v.v.)
- Từ khóa theo phong cách (${randomStyle})
- Hậu tố thương hiệu ("Vam3D", "Vam 3D", v.v.)

4. "description": Tự viết đoạn mô tả 2 đến 3 câu (60 đến 85 từ) chuẩn SEO Google bám sát trực tiếp vào tiêu đề và phong cách vừa tạo, giọng văn kích thích thị giác, nhấn mạnh độ phân giải 4K siêu nét, không watermark độc quyền tại Vam3D và kêu gọi xem trọn bộ.

CHỈ TRẢ VỀ ĐÚNG ĐỊNH DẠNG JSON HỢP LỆ:
{
  "title": "string",
  "slug": "string",
  "hotKeys": ["string", "string"],
  "description": "string"
}`;

  try {
    const aiResult = await callGeminiJson<GalleryGeminiResult>({
      prompt,
      systemInstruction: "Bạn là Gemini AI sáng tạo tiêu đề và mô tả SEO nghệ thuật 3D Cosplay 18+ độc quyền cho Vam3D. Mỗi lần sinh phải mang một phong cách và cấu trúc tiêu đề hoàn toàn mới lạ. Luôn trả về đúng 25 đến 30 từ khóa hot search trong mảng hotKeys. Luôn trả về JSON hợp lệ.",
      temperature: 1.0,
      maxTokens: 1500,
    });

    if (aiResult && aiResult.title && aiResult.description) {
      return {
        title: aiResult.title.replace(/^["']|["']$/g, "").trim(),
        slug: aiResult.slug || slugify(aiResult.title),
        hotKeys: Array.isArray(aiResult.hotKeys) && aiResult.hotKeys.length >= 10 ? aiResult.hotKeys : buildDefaultHotKeys(charText, movieName),
        description: aiResult.description.replace(/^["']|["']$/g, "").trim(),
      };
    }
  } catch (err) {
    console.warn("Gemini gallery generation failed:", err);
  }

  // Fallback to algorithmic synthesizer if Gemini is unavailable
  const fallbackTitle = `Cosplay 18+ ${charText} ${movieName ? `(${movieName}) ` : ""}– Vẻ Đẹp Tuyệt Mỹ | Ảnh Sex AI 3D 4K Vam3D`;
  return {
    title: fallbackTitle,
    slug: slugify(fallbackTitle),
    hotKeys: buildDefaultHotKeys(charText, movieName),
    description: generateAlgorithmicSeoDescription({
      title: fallbackTitle,
      characterNames,
      movieName,
    }),
  };
}

function buildDefaultHotKeys(charText: string, movieName?: string): string[] {
  return [
    `${charText}`,
    `${charText} 3D`,
    `${charText} cosplay 18+`,
    `${charText} 4K`,
    `${charText} bikini`,
    `${charText} không che`,
    `${charText} gợi cảm`,
    `${charText} waifu`,
    `${charText} hentai 3D`,
    ...(movieName ? [`${movieName}`, `${movieName} 3D`, `${charText} ${movieName}`] : []),
    "Cosplay 18+",
    "Ảnh Sex AI 3D",
    "Sex AI Vietsub",
    "Ảnh Sex 3D",
    "Hentai 3D Trung Quốc",
    "Waifu 3D gợi cảm",
    "Donghua 18+",
    "Mỹ nhân 3D bốc lửa",
    "Ảnh 4K siêu nét",
    "Không che siêu nét",
    "Cosplay anime 3D",
    "Nữ đế kiêu sa",
    "Đường cong nghẹt thở",
    "Nội y phòng ngủ",
    "Kho ảnh AI 18+",
    "Ảnh nude 3D nghệ thuật",
    "Waifu không che",
    "Album ảnh sex 3D",
    "Vam3D",
    "Vam3D 4K",
  ];
}
