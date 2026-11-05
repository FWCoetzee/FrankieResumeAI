import { config } from 'dotenv';

config();

const apiKey =
  process.env.GOOGLE_GENAI_API_KEY ??
  process.env.GOOGLE_API_KEY ??
  process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error(
    'Gemini API key is not configured. Set GOOGLE_GENAI_API_KEY in .env.'
  );
  process.exit(1);
}

const baseUrl =
  process.env.GOOGLE_GENAI_API_URL ??
  'https://generativelanguage.googleapis.com';
const model =
  process.env.GOOGLE_GENAI_CHECK_MODEL ??
  'gemini-3.6-flash';
const apiUrl = new URL(baseUrl);
const endpointBaseUrl =
  apiUrl.hostname === 'generativelanguage.googleapis.com'
    ? `${apiUrl.origin}/v1beta/models`
    : `${baseUrl.replace(/\/$/, '').replace(/\/v\d+(?:beta\d*)?\/models$/, '')}/v1beta/models`;
const url = `${endpointBaseUrl}/${model}:generateContent`;
let lastMessage = '';

for (let attempt = 1; attempt <= 3; attempt++) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{ text: 'Reply with the single word OK.' }],
        }],
        generationConfig: {
          maxOutputTokens: 8,
          temperature: 0,
        },
      }),
    });

    const responseText = await response.text();
    let body = null;
    try {
      body = JSON.parse(responseText);
    } catch {
      body = null;
    }
    if (response.ok) {
      const text = body?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text ?? '')
        .join('')
        .trim();

      console.log(`Gemini check passed for ${model}${text ? `: ${text}` : '.'}`);
      process.exit(0);
    }

    const responseFallback = responseText.trim().slice(0, 300);
    lastMessage =
      body?.error?.message ??
      body?.error?.status ??
      responseFallback ??
      `HTTP ${response.status}`;

    if ((response.status === 429 || response.status >= 500) && attempt < 3) {
      await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
      continue;
    }
    break;
  } catch (error) {
    lastMessage =
      error instanceof Error ? error.message : String(error);
    if (attempt < 3) {
      await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
      continue;
    }
  }
}

console.error(`Gemini check failed for ${model}: ${lastMessage}`);
process.exit(1);
