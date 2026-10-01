/**
 * Core Google Gemini AI Service for Vam3D
 * - Compatible with Edge runtime & Cloudflare Workers (pure fetch)
 * - Optimized with BLOCK_NONE safety thresholds for anime / 3D / cosplay keywords
 * - Dual-model failover: gemini-2.0-flash -> gemini-1.5-flash -> OpenAI -> fallback
 */

interface GeminiRequestOptions {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export function getGeminiApiKey(): string | undefined {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY
  );
}

export function isGeminiConfigured(): boolean {
  return Boolean(getGeminiApiKey());
}

/**
 * Common safety settings with BLOCK_NONE to prevent false positives on
 * Donghua / Anime / Cosplay / 3D adult content keywords.
 */
const SAFETY_SETTINGS = [
  { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
  { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
  { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
  { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
  { category: "HARM_CATEGORY_CIVIC_INTEGRITY", threshold: "BLOCK_NONE" },
];

/**
 * Invoke Gemini with automatic model failover (gemini-2.0-flash -> gemini-1.5-flash)
 */
export async function callGeminiText(options: GeminiRequestOptions): Promise<string | null> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return null;
  }

  const { prompt, systemInstruction, temperature = 0.7, maxTokens = 1500, jsonMode = false } = options;
  const models = [
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash",
    "gemini-3.7-flash",
    "gemini-3.8-flash",
  ];

  for (const model of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const requestBody: any = {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        safetySettings: SAFETY_SETTINGS,
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
          ...(jsonMode ? { responseMimeType: "application/json" } : {}),
        },
      };

      if (systemInstruction) {
        requestBody.systemInstruction = {
          parts: [{ text: systemInstruction }],
        };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(20000),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        console.warn(`Gemini (${model}) returned status ${response.status}:`, errorText.slice(0, 200));
        continue; // Try next model
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (text) {
        return text;
      }
    } catch (err: any) {
      console.warn(`Gemini (${model}) call failed:`, err?.message || err);
    }
  }

  return null;
}

/**
 * Invoke Gemini returning structured JSON data
 */
export async function callGeminiJson<T = any>(options: GeminiRequestOptions): Promise<T | null> {
  const rawText = await callGeminiText({ ...options, jsonMode: true });
  if (!rawText) return null;

  try {
    // Strip possible markdown fences ```json ... ```
    const cleaned = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.warn("Failed to parse Gemini JSON response:", rawText, err);
    return null;
  }
}

/**
 * Optional OpenAI fallback if OPENAI_API_KEY is configured
 */
export async function callOpenAiFallback(options: GeminiRequestOptions): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const { prompt, systemInstruction, temperature = 0.7, maxTokens = 400, jsonMode = false } = options;

    const messages: any[] = [];
    if (systemInstruction) {
      messages.push({ role: "system", content: systemInstruction });
    }
    messages.push({ role: "user", content: prompt });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature,
        max_tokens: maxTokens,
        ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
      }),
      signal: AbortSignal.timeout(9000),
    });

    if (response.ok) {
      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content?.trim();
      return text || null;
    }
  } catch (err: any) {
    console.warn("OpenAI fallback failed:", err?.message || err);
  }

  return null;
}
