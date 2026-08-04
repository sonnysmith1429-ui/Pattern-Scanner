/**
 * Thin wrapper around tesseract.js. Loaded lazily (dynamic import) so the
 * ~2MB OCR engine only downloads when a user actually uploads a screenshot,
 * never on initial page load.
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
  const worker = await createWorker('eng');
  try {
    const { data } = await worker.recognize(dataUrl, {}, { blocks: true });
    const words = flattenWords(data.blocks);
    const imageHeight = Math.max(1, ...words.map((w) => w.bbox.y1));
    return { words, imageHeight };
  } finally {
    await worker.terminate();
  }
}
