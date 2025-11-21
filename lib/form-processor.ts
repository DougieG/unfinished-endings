/**
 * ENDING CARE FORM PROCESSOR
 * Extracts sketch and text from standardized intake forms using OCR
 */

import sharp from 'sharp';
import { createWorker, type Worker } from 'tesseract.js';

// Form template coordinates (based on standard 8.5" × 11" at 300 DPI)
// Adjust these based on your actual scanned form dimensions
export const FORM_REGIONS = {
  // Visual Reference sketch area (large drawing space)
  VISUAL_REFERENCE: {
    x: 40,
    y: 403,
    width: 380,
    height: 305
  },
  
  // Title field (single line)
  TITLE: {
    x: 90,
    y: 732,
    width: 330,
    height: 44
  },
  
  // First name field
  FIRST_NAME: {
    x: 145,
    y: 777,
    width: 275,
    height: 44
  },
  
  // Email field
  EMAIL: {
    x: 90,
    y: 821,
    width: 330,
    height: 44
  },
  
  // Category checkboxes area
  CATEGORY: {
    x: 40,
    y: 112,
    width: 380,
    height: 110
  },
  
  // Ache scale circles
  ACHE_SCALE: {
    x: 40,
    y: 263,
    width: 380,
    height: 100
  }
};

export interface FormExtractionResult {
  // Extracted images
  originalFormUrl?: string;
  sketchImageBuffer: Buffer;
  sketchProcessedBuffer: Buffer;
  
  // OCR extracted text
  title: string;
  firstName: string;
  email: string;
  
  // Form metadata
  confidence: {
    title: number;
    firstName: number;
    email: number;
  };
  
  // Processing info
  processedAt: Date;
  formDimensions: { width: number; height: number };
}

/**
 * Initialize Tesseract OCR worker (reuse for performance)
 */
let ocrWorker: Worker | null = null;

async function getOCRWorker(): Promise<Worker> {
  if (!ocrWorker) {
    ocrWorker = await createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`📖 OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      }
    });
  }
  return ocrWorker;
}

/**
 * Clean up OCR worker when done
 */
export async function terminateOCRWorker() {
  if (ocrWorker) {
    await ocrWorker.terminate();
    ocrWorker = null;
  }
}

/**
 * Preprocess image region for better OCR accuracy
 */
async function preprocessForOCR(
  imageBuffer: Buffer,
  region: typeof FORM_REGIONS.TITLE
): Promise<Buffer> {
  return sharp(imageBuffer)
    .extract({
      left: region.x,
      top: region.y,
      width: region.width,
      height: region.height
    })
    .greyscale()
    .normalise() // Enhance contrast
    .sharpen() // Sharpen edges
    .threshold(128) // Binary threshold for clean text
    .toBuffer();
}

/**
 * Extract text from a specific form region using OCR
 */
async function extractTextFromRegion(
  imageBuffer: Buffer,
  region: typeof FORM_REGIONS.TITLE
): Promise<{ text: string; confidence: number }> {
  try {
    // Preprocess the region
    const processedRegion = await preprocessForOCR(imageBuffer, region);
    
    // Run OCR
    const worker = await getOCRWorker();
    const { data } = await worker.recognize(processedRegion);
    
    // Clean up extracted text
    const cleanText = data.text
      .trim()
      .replace(/[^\w\s@.-]/g, '') // Keep alphanumeric, spaces, @, ., -
      .replace(/\s+/g, ' '); // Normalize whitespace
    
    return {
      text: cleanText,
      confidence: data.confidence / 100 // Convert to 0-1 range
    };
  } catch (error) {
    console.error('OCR extraction failed:', error);
    return { text: '', confidence: 0 };
  }
}

/**
 * Extract and process the visual reference sketch
 */
async function extractSketch(
  imageBuffer: Buffer
): Promise<{ original: Buffer; processed: Buffer }> {
  const region = FORM_REGIONS.VISUAL_REFERENCE;
  
  // Extract original sketch region
  const original = await sharp(imageBuffer)
    .extract({
      left: region.x,
      top: region.y,
      width: region.width,
      height: region.height
    })
    .toBuffer();
  
  // Process into clean silhouette (black on white)
  const processed = await sharp(original)
    .greyscale()
    .normalise() // Maximize contrast
    .threshold(128) // Binary threshold
    .negate() // Invert if needed (make drawings black)
    .toFormat('png')
    .toBuffer();
  
  return { original, processed };
}

/**
 * Detect form dimensions and auto-scale regions if needed
 */
async function detectFormDimensions(
  imageBuffer: Buffer
): Promise<{ width: number; height: number; scale: number }> {
  const metadata = await sharp(imageBuffer).metadata();
  const width = metadata.width || 0;
  const height = metadata.height || 0;
  
  // Expected dimensions at 300 DPI: 2550 × 3300 pixels
  const expectedWidth = 2550;
  const scale = width / expectedWidth;
  
  return { width, height, scale };
}

/**
 * Scale form regions based on actual image dimensions
 */
function scaleRegions(
  scale: number
): typeof FORM_REGIONS {
  const scaled: any = {};
  
  for (const [key, region] of Object.entries(FORM_REGIONS)) {
    scaled[key] = {
      x: Math.round(region.x * scale),
      y: Math.round(region.y * scale),
      width: Math.round(region.width * scale),
      height: Math.round(region.height * scale)
    };
  }
  
  return scaled as typeof FORM_REGIONS;
}

/**
 * MAIN FUNCTION: Process complete Ending Care Form
 * Extracts sketch and all text fields via OCR
 */
export async function processEndingCareForm(
  imageBuffer: Buffer
): Promise<FormExtractionResult> {
  console.log('🎨 Starting form processing...');
  
  // Detect dimensions and scale regions
  const { width, height, scale } = await detectFormDimensions(imageBuffer);
  console.log(`📏 Form dimensions: ${width} × ${height} (scale: ${scale.toFixed(2)})`);
  
  const regions = scale !== 1 ? scaleRegions(scale) : FORM_REGIONS;
  
  // Extract sketch
  console.log('🖼️  Extracting visual reference sketch...');
  const { original: sketchImageBuffer, processed: sketchProcessedBuffer } = 
    await extractSketch(imageBuffer);
  
  // Extract text fields via OCR
  console.log('📖 Extracting title via OCR...');
  const titleResult = await extractTextFromRegion(imageBuffer, regions.TITLE);
  
  console.log('📖 Extracting first name via OCR...');
  const firstNameResult = await extractTextFromRegion(imageBuffer, regions.FIRST_NAME);
  
  console.log('📖 Extracting email via OCR...');
  const emailResult = await extractTextFromRegion(imageBuffer, regions.EMAIL);
  
  console.log('✅ Form processing complete!');
  console.log(`   Title: "${titleResult.text}" (${Math.round(titleResult.confidence * 100)}% confidence)`);
  console.log(`   Name: "${firstNameResult.text}" (${Math.round(firstNameResult.confidence * 100)}% confidence)`);
  console.log(`   Email: "${emailResult.text}" (${Math.round(emailResult.confidence * 100)}% confidence)`);
  
  return {
    sketchImageBuffer,
    sketchProcessedBuffer,
    title: titleResult.text,
    firstName: firstNameResult.text,
    email: emailResult.text,
    confidence: {
      title: titleResult.confidence,
      firstName: firstNameResult.confidence,
      email: emailResult.confidence
    },
    processedAt: new Date(),
    formDimensions: { width, height }
  };
}

/**
 * Validate extracted email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Clean and validate extracted title
 */
export function cleanTitle(title: string): string {
  return title
    .trim()
    .replace(/\s+/g, ' ')
    .substring(0, 200); // Max 200 chars
}
