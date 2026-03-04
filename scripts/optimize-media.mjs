/**
 * Media Optimization Script
 * 
 * Compresses images to WebP and creates thumbnails.
 * Compresses the landing video and extracts a poster frame.
 * 
 * Output structure:
 *   public/Fotos-optimized/  (mirrors public/Fotos/ but with WebP + thumbnails)
 *   public/Fotos-optimized/Video/landing_background.mp4  (compressed ~5-10MB)
 *   public/Fotos-optimized/Video/landing_poster.webp     (poster frame)
 */

import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import { readdir, mkdir, stat } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const INPUT_DIR = path.join(ROOT, 'public', 'Fotos');
const OUTPUT_DIR = path.join(ROOT, 'public', 'Fotos-optimized');

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic);

// Configuration
const IMAGE_CONFIG = {
  full: { maxWidth: 1920, quality: 78 },       // Full-size images (~150-400KB)
  thumbnail: { maxWidth: 600, quality: 70 },    // Card thumbnails (~30-80KB)
  micro: { maxWidth: 100, quality: 50 },        // Blur placeholders (~2-5KB)
};

const VIDEO_CONFIG = {
  // Target ~5-8 MB for a 30-60s video
  crf: 28,          // Constant Rate Factor (higher = smaller, 23 is default)
  maxWidth: 1280,   // 720p width
  audioBitrate: '0', // No audio needed for background
  preset: 'slow',   // Better compression
};

// ──────────────────────────────────────────
// Image Processing
// ──────────────────────────────────────────

async function getAllImageFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'Video') continue; // Skip video folder for images
      files.push(...await getAllImageFiles(fullPath));
    } else if (/\.(jpg|jpeg|png|webp)$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

async function optimizeImage(inputPath, outputDir) {
  const relativePath = path.relative(INPUT_DIR, inputPath);
  const parsed = path.parse(relativePath);
  const baseOutputDir = path.join(OUTPUT_DIR, parsed.dir);
  
  await mkdir(baseOutputDir, { recursive: true });
  
  const results = [];
  
  // Full-size WebP
  const fullOutput = path.join(baseOutputDir, `${parsed.name}.webp`);
  try {
    await sharp(inputPath)
      .resize({ width: IMAGE_CONFIG.full.maxWidth, withoutEnlargement: true })
      .webp({ quality: IMAGE_CONFIG.full.quality })
      .toFile(fullOutput);
    
    const fullStat = await stat(fullOutput);
    results.push({ type: 'full', size: fullStat.size });
  } catch (err) {
    console.error(`  ❌ Failed full: ${relativePath} - ${err.message}`);
  }
  
  // Thumbnail WebP
  const thumbDir = path.join(baseOutputDir, 'thumbs');
  await mkdir(thumbDir, { recursive: true });
  const thumbOutput = path.join(thumbDir, `${parsed.name}.webp`);
  try {
    await sharp(inputPath)
      .resize({ width: IMAGE_CONFIG.thumbnail.maxWidth, withoutEnlargement: true })
      .webp({ quality: IMAGE_CONFIG.thumbnail.quality })
      .toFile(thumbOutput);
    
    const thumbStat = await stat(thumbOutput);
    results.push({ type: 'thumb', size: thumbStat.size });
  } catch (err) {
    console.error(`  ❌ Failed thumb: ${relativePath} - ${err.message}`);
  }
  
  // Micro placeholder (for blur-up effect)
  const microDir = path.join(baseOutputDir, 'micro');
  await mkdir(microDir, { recursive: true });
  const microOutput = path.join(microDir, `${parsed.name}.webp`);
  try {
    await sharp(inputPath)
      .resize({ width: IMAGE_CONFIG.micro.maxWidth })
      .blur(5)
      .webp({ quality: IMAGE_CONFIG.micro.quality })
      .toFile(microOutput);
  } catch (err) {
    // Non-critical, skip
  }
  
  return results;
}

async function processAllImages() {
  console.log('\n📸 Processing images...\n');
  
  const imageFiles = await getAllImageFiles(INPUT_DIR);
  console.log(`Found ${imageFiles.length} images to optimize\n`);
  
  let totalOriginal = 0;
  let totalOptimized = 0;
  let processed = 0;
  
  // Process in batches of 4 for memory management
  const batchSize = 4;
  for (let i = 0; i < imageFiles.length; i += batchSize) {
    const batch = imageFiles.slice(i, i + batchSize);
    const results = await Promise.all(batch.map(async (file) => {
      const originalStat = await stat(file);
      totalOriginal += originalStat.size;
      
      const optimized = await optimizeImage(file, OUTPUT_DIR);
      const fullResult = optimized.find(r => r.type === 'full');
      if (fullResult) totalOptimized += fullResult.size;
      
      processed++;
      const relativePath = path.relative(INPUT_DIR, file);
      const origMB = (originalStat.size / 1024 / 1024).toFixed(2);
      const newKB = fullResult ? (fullResult.size / 1024).toFixed(0) : '?';
      console.log(`  [${processed}/${imageFiles.length}] ${relativePath}: ${origMB}MB → ${newKB}KB`);
      
      return optimized;
    }));
  }
  
  console.log(`\n✅ Images done!`);
  console.log(`   Original: ${(totalOriginal / 1024 / 1024).toFixed(1)} MB`);
  console.log(`   Optimized: ${(totalOptimized / 1024 / 1024).toFixed(1)} MB`);
  console.log(`   Savings: ${((1 - totalOptimized / totalOriginal) * 100).toFixed(1)}%\n`);
}

// ──────────────────────────────────────────
// Video Processing
// ──────────────────────────────────────────

async function processVideo() {
  const videoInput = path.join(INPUT_DIR, 'Video', 'landing_background.mp4');
  const videoOutputDir = path.join(OUTPUT_DIR, 'Video');
  await mkdir(videoOutputDir, { recursive: true });
  
  const videoOutput = path.join(videoOutputDir, 'landing_background.mp4');
  const posterOutput = path.join(videoOutputDir, 'landing_poster.webp');
  
  // Check if input exists
  try {
    await stat(videoInput);
  } catch {
    console.log('⚠️  Video file not found, skipping video optimization');
    return;
  }
  
  const inputStat = await stat(videoInput);
  console.log(`🎬 Processing video (${(inputStat.size / 1024 / 1024).toFixed(1)} MB)...\n`);
  
  // Extract poster frame (first frame at 1 second)
  console.log('  Extracting poster frame...');
  await new Promise((resolve, reject) => {
    ffmpeg(videoInput)
      .screenshots({
        count: 1,
        timemarks: ['00:00:01'],
        filename: 'poster_temp.jpg',
        folder: videoOutputDir,
        size: '1920x?',
      })
      .on('end', resolve)
      .on('error', reject);
  });
  
  // Convert poster to WebP
  const tempPoster = path.join(videoOutputDir, 'poster_temp.jpg');
  try {
    await sharp(tempPoster)
      .webp({ quality: 80 })
      .toFile(posterOutput);
    
    // Clean up temp
    const { unlink } = await import('fs/promises');
    await unlink(tempPoster);
    console.log('  ✅ Poster frame extracted');
  } catch (err) {
    console.error('  ❌ Poster extraction failed:', err.message);
  }
  
  // Compress video
  console.log('  Compressing video (this may take a few minutes)...');
  await new Promise((resolve, reject) => {
    ffmpeg(videoInput)
      .videoCodec('libx264')
      .size(`${VIDEO_CONFIG.maxWidth}x?`)
      .addOption('-crf', String(VIDEO_CONFIG.crf))
      .addOption('-preset', VIDEO_CONFIG.preset)
      .addOption('-profile:v', 'main')
      .addOption('-movflags', '+faststart')  // Critical: allows progressive loading
      .noAudio()                              // Background video doesn't need audio
      .output(videoOutput)
      .on('progress', (progress) => {
        if (progress.percent) {
          process.stdout.write(`\r  Progress: ${progress.percent.toFixed(1)}%`);
        }
      })
      .on('end', () => {
        console.log('\n  ✅ Video compressed');
        resolve();
      })
      .on('error', (err) => {
        console.error('\n  ❌ Video compression failed:', err.message);
        reject(err);
      })
      .run();
  });
  
  // Report savings
  try {
    const outputStat = await stat(videoOutput);
    const origMB = (inputStat.size / 1024 / 1024).toFixed(1);
    const newMB = (outputStat.size / 1024 / 1024).toFixed(1);
    const savings = ((1 - outputStat.size / inputStat.size) * 100).toFixed(1);
    console.log(`\n  Video: ${origMB} MB → ${newMB} MB (${savings}% savings)`);
  } catch {}
}

// ──────────────────────────────────────────
// Main
// ──────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  SunEliteHomes Media Optimization Script');
  console.log('═══════════════════════════════════════════');
  
  await mkdir(OUTPUT_DIR, { recursive: true });
  
  await processAllImages();
  await processVideo();
  
  console.log('\n═══════════════════════════════════════════');
  console.log('  ✅ All optimizations complete!');
  console.log('  Output: public/Fotos-optimized/');
  console.log('═══════════════════════════════════════════\n');
}

main().catch(console.error);
