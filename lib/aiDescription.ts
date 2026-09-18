/**
 * AI SEO Description Generator for Vam3D / RoPhim
 * Enhanced with Top Performing Google Search Keywords (Vam3D, Vam 3D, Sex AI Vietsub, Hentai 3D Trung Quốc...)
 */

interface GenerateDescriptionParams {
  title: string;
  characterNames?: string[];
  movieName?: string;
  type?: "gallery" | "movie" | "character";
}

/**
 * Intelligent algorithmic synthesizer for Vietnamese SEO descriptions
 * Incorporates high-performing Google search terms naturally.
 */
function generateAlgorithmicSeoDescription({
  title,
  characterNames = [],
  movieName,
}: GenerateDescriptionParams): string {
  const cleanTitle = title.trim();
  const charListStr = characterNames.length > 0 ? characterNames.join(", ") : "";

  // Dynamic openers targeting top keyword clusters (vam3d, sex ai vietsub, hentai 3d, cosplay 18+)
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

  const selectedOpener = randomItem(openers);
  const selectedMiddle = randomItem(middleSentences);
  const selectedCloser = randomItem(closers);

  return `${selectedOpener} ${selectedMiddle} ${selectedCloser}`;
}

/**
 * Calls Gemini or OpenAI API if key is available, otherwise falls back to smart synthesizer.
 */
export async function generateAiSeoDescription(params: GenerateDescriptionParams): Promise<string> {
  const { title, characterNames = [], movieName } = params;

  if (!title || !title.trim()) {
    throw new Error("Tiêu đề không được để trống khi sinh mô tả.");
  }

  const geminiApiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  const openAiApiKey = process.env.OPENAI_API_KEY;

  const charContext = characterNames.length > 0 ? `Nhân vật xuất hiện: ${characterNames.join(", ")}.` : "";
  const movieContext = movieName ? `Thuộc phim/tác phẩm: ${movieName}.` : "";

  // Prompt engineered with high-volume SEO keywords from Google Search Console
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

  // 1. Try Google Gemini API if key is configured
  if (geminiApiKey) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 250,
          },
        }),
        signal: AbortSignal.timeout(8000),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) {
          return text.replace(/^["']|["']$/g, "").trim();
        }
      }
    } catch (e) {
      console.warn("Gemini API call failed, using algorithmic fallback:", e);
    }
  }

  // 2. Try OpenAI API if key is configured
  if (openAiApiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "Bạn là chuyên gia SEO & Copywriter cho website ảnh AI, 3D Anime, Hentai 3D Vam3D. Luôn trả lời bằng tiếng Việt hấp dẫn, chuẩn SEO.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 250,
        }),
        signal: AbortSignal.timeout(8000),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content?.trim();
        if (text) {
          return text.replace(/^["']|["']$/g, "").trim();
        }
      }
    } catch (e) {
      console.warn("OpenAI API call failed, using algorithmic fallback:", e);
    }
  }

  // 3. Fallback to smart algorithmic synthesizer
  return generateAlgorithmicSeoDescription(params);
}
