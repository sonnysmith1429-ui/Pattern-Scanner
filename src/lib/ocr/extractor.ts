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
 * before OCR runs, and this module uses those instead — otherwise behaviour
 * is unchanged. Nothing else in the app needs to know this exists.
 *
 * The language data is delivered by pre-seeding tesseract.js's own
 * IndexedDB cache (rather than passing it directly via createWorker's
 * `{code, data}` language-object form) because that form is broken in the
 * installed tesseract.js version — its `initialize` step joins language
 * identifiers with `l.data` instead of `l.code`, corrupting the init call.
 * Seeding the cache lets tesseract.js's normal cache-hit path pick up the
 * data with `langs` passed as a plain string, sidestepping that bug.
 */
import type { Block } from 'tesseract.js';

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
  /** Base64-encoded eng.traineddata.gz */
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

/** Matches tesseract.js's own idb-keyval cache: db "keyval-store", store "keyval", key "./eng.traineddata". */
function seedTesseractLanguageCache(lang: string, data: Uint8Array): Promise<void> {
  return new Promise((resolve, reject) => {
    const openReq = indexedDB.open('keyval-store');
    openReq.onupgradeneeded = () => openReq.result.createObjectStore('keyval');
    openReq.onerror = () => reject(openReq.error);
    openReq.onsuccess = () => {
      const db = openReq.result;
      const tx = db.transaction('keyval', 'readwrite');
      tx.objectStore('keyval').put(data, `./${lang}.traineddata`);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
  });
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

  if (overrides) {
    await seedTesseractLanguageCache('eng', base64ToUint8Array(overrides.langDataBase64));
  }

  const worker = overrides
    ? await createWorker('eng', undefined, { workerPath: overrides.workerPath, corePath: overrides.corePath })
    : await createWorker('eng');

  try {
    const { data } = await worker.recognize(dataUrl, {}, { blocks: true });
    const words = flattenWords(data.blocks);
    const imageHeight = Math.max(1, ...words.map((w) => w.bbox.y1));
    return { words, imageHeight };
  } finally {
    await worker.terminate();
  }
}
