/**
 * SIMPLIFIED FORM PROCESSOR
 * No OCR - just extract and process the sketch image
 * User enters text manually
 */

import sharp from 'sharp';

// Sketch region coordinates (standard 8.5" × 11" form)
const SKETCH_REGION = {
  x: 40,
  y: 403,
  width: 380,
  height: 305
};

export interface SimplifiedFormData {
  sketchImageBuffer: Buffer;
  sketchProcessedBuffer: Buffer;
  processedAt: string;
  formDimensions: { width: number; height: number };
}

/**
 * Extract and process sketch from form image
 * NO OCR - just image processing
 */
export async function processFormSimple(imageBuffer: Buffer): Promise<SimplifiedFormData> {
  console.log('📸 Starting simple form processing (no OCR)');
  
  // Get image metadata
  const metadata = await sharp(imageBuffer).metadata();
  const width = metadata.width || 2550;
  const height = metadata.height || 3300;
  
  console.log(`📐 Image size: ${width}x${height}`);
  
  // Scale coordinates if needed
  const scaleX = width / 2550;
  const scaleY = height / 3300;
  
  const sketchX = Math.round(SKETCH_REGION.x * scaleX);
  const sketchY = Math.round(SKETCH_REGION.y * scaleY);
  const sketchWidth = Math.round(SKETCH_REGION.width * scaleX);
  const sketchHeight = Math.round(SKETCH_REGION.height * scaleY);
  
  // Extract sketch region
  console.log('✂️ Extracting sketch region');
  const sketchBuffer = await sharp(imageBuffer)
    .extract({
      left: sketchX,
      top: sketchY,
      width: sketchWidth,
      height: sketchHeight
    })
    .png()
    .toBuffer();
  
  // Process sketch into silhouette
  console.log('🎨 Converting to silhouette');
  const processedBuffer = await sharp(sketchBuffer)
    .greyscale()
    .threshold(180) // Convert to black/white
    .negate() // Invert colors (white background, black sketch)
    .png()
    .toBuffer();
  
  console.log('✅ Processing complete (no OCR)');
  
  return {
    sketchImageBuffer: sketchBuffer,
    sketchProcessedBuffer: processedBuffer,
    processedAt: new Date().toISOString(),
    formDimensions: { width, height }
  };
}
