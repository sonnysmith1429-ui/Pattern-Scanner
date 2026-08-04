/**
 * Thin wrapper around tesseract.js. Loaded lazily (dynamic import) so the
 * ~2MB OCR engine only downloads when a user actually uploads a screenshot,
 * never on initial page load.
 *
 * By default tesseract.js fetches its WASM core, worker script, and language
 * data from a CDN at runtime. That's the right tradeoff for a real
 * deployment (keeps this repo's bundle small), but it means OCR can't work
 * anywhere that blocks outbound network requests — e.g. a sandboxed static
 * preview. For that scenario only, a host page can set
 * `window.__OCR_ASSET_OVERRIDES__` (with those assets embedded/self-hosted)
 * before this module runs, and it'll be used instead of the CDN. Nothing
 * else in the app needs to know this exists.
 */
import type { Block, Lang } from 'tesseract.js';

export interface OcrWord {
  text: string;
  confidence: number;
  bbox: { x0: number; y0: number; x1: number; y1: number };
}

export interface OcrResult {
  words: OcrWord[];
  imageHeight: number;
}

export interface OcrAssetOverrides {
  workerPath: string;
  corePath: string;
  /** Base64-encoded eng.traineddata(.gz) */
  langDataBase64: string;
}

declare global {
  interface Window {
    __OCR_ASSET_OVERRIDES__?: OcrAssetOverrides;
  }
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function flattenWords(blocks: Block[] | null): OcrWord[] {
  if (!blocks) return [];
  const words: OcrWord[] = [];
  for (const block of blocks) {
    for (const paragraph of block.paragraphs ?? []) {
      for (const line of paragraph.lines ?? []) {
        for (const word of line.words ?? []) {
          words.push({ text: word.text, confidence: word.confidence, bbox: word.bbox });
        }
      }
    }
  }
  return words;
}

export async function extractTextFromImage(dataUrl: string): Promise<OcrResult> {
  const { createWorker } = await import('tesseract.js');
  const overrides = typeof window !== 'undefined' ? window.__OCR_ASSET_OVERRIDES__ : undefined;

  const langs: string | Lang[] = overrides
    ? [{ code: 'eng', data: base64ToUint8Array(overrides.langDataBase64) }]
    : 'eng';
  const worker = overrides
    ? await createWorker(langs, undefined, { workerPath: overrides.workerPath, corePath: overrides.corePath })
    : await createWorker(langs);

  try {
    const { data } = await worker.recognize(dataUrl, {}, { blocks: true });
    const words = flattenWords(data.blocks);
    const imageHeight = Math.max(1, ...words.map((w) => w.bbox.y1));
    return { words, imageHeight };
  } finally {
    await worker.terminate();
  }
}
