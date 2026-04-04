/**
 * Exposé PDF Generator — Elegant landscape real-estate brochure
 * Uses jsPDF to produce a branded property exposé in blue & white.
 */
import jsPDF from 'jspdf';
import type { Property } from '../data/properties';
import { formatPrice } from '../data/properties';
import logoUrl from '../assets/logo.png';

/* ── Brand palette (blue & white only) ─────────────────── */
const NAVY: [number, number, number] = [15, 23, 42];       // #0F172A
const BLUE_DARK: [number, number, number] = [30, 41, 59];   // #1E293B
const BLUE_MID: [number, number, number] = [71, 85, 105];   // #475569
const BLUE_LIGHT: [number, number, number] = [148, 163, 184]; // #94A3B8
const BLUE_PALE: [number, number, number] = [226, 232, 240]; // #E2E8F0
const BLUE_ICE: [number, number, number] = [241, 245, 249];  // #F1F5F9
const WHITE: [number, number, number] = [255, 255, 255];

/* ── Landscape A4 constants ────────────────────────────── */
const PW = 297; // landscape width
const PH = 210; // landscape height

/* ── Helpers ───────────────────────────────────────────── */

/** Fetch an image url → base64 data-URL.
 *  Tries fetch (CORS) first, then falls back to <img> + canvas. */
async function imageToBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (res.ok) {
      const blob = await res.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    }
  } catch { /* CORS blocked — try fallback */ }

  try {
    return await new Promise<string | null>((resolve) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) { resolve(null); return; }
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.9));
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = url;
      setTimeout(() => resolve(null), 8000);
    });
  } catch {
    return null;
  }
}

/** Get image dimensions from base64 */
function getImageDimensions(
  dataUrl: string,
): Promise<{ w: number; h: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.width, h: img.height });
    img.onerror = () => resolve({ w: 1, h: 1 });
    img.src = dataUrl;
  });
}

/** Draw a thin accent line in navy */
function accentLine(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  thickness = 0.5,
  color: [number, number, number] = WHITE,
) {
  doc.setDrawColor(...color);
  doc.setLineWidth(thickness);
  doc.line(x, y, x + width, y);
}

/** Wrap text and return lines */
function splitText(doc: jsPDF, text: string, maxWidth: number): string[] {
  return doc.splitTextToSize(text, maxWidth) as string[];
}

/** Draw a cover-fill image inside a clipped rectangle */
function drawCoverImage(
  doc: jsPDF,
  imgData: string,
  dims: { w: number; h: number },
  x: number,
  y: number,
  cellW: number,
  cellH: number,
  radius = 0,
) {
  const imgRatio = dims.w / dims.h;
  const cellRatio = cellW / cellH;
  let dw = cellW, dh = cellH, dx = x, dy = y;
  if (imgRatio > cellRatio) {
    dh = cellH;
    dw = cellH * imgRatio;
    dx = x - (dw - cellW) / 2;
  } else {
    dw = cellW;
    dh = cellW / imgRatio;
    dy = y - (dh - cellH) / 2;
  }
  doc.saveGraphicsState();
  if (radius > 0) {
    doc.roundedRect(x, y, cellW, cellH, radius, radius, null);
  } else {
    doc.rect(x, y, cellW, cellH, null);
  }
  doc.clip();
  doc.discardPath();
  doc.addImage(imgData, 'JPEG', dx, dy, dw, dh);
  doc.restoreGraphicsState();
}

/* ── PDF GENERATION ────────────────────────────────────── */

export interface ExposeProgress {
  phase: string;
  percent: number;
}

export interface GenerateExposeOptions {
  /** If true, returns {blob, filename} instead of downloading */
  returnBlob?: boolean;
}

export interface ExposeResult {
  blob: Blob;
  filename: string;
  base64: string;
}

export async function generateExpose(
  property: Property,
  onProgress?: (p: ExposeProgress) => void,
  options?: GenerateExposeOptions,
): Promise<ExposeResult | void> {
  const report = (phase: string, percent: number) =>
    onProgress?.({ phase, percent });

  report('Preparando documento…', 0);

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W = PW;
  const H = PH;
  const MARGIN = 14;
  const CONTENT_W = W - MARGIN * 2;

  /* ─────────────── PRE-LOAD IMAGES ─────────────── */
  report('Descargando imágenes…', 5);

  const logoData = await imageToBase64(logoUrl);
  const logoDims = logoData ? await getImageDimensions(logoData) : null;

  const imageDataUrls: (string | null)[] = [];
  for (let i = 0; i < property.images.length; i++) {
    report(
      `Descargando imagen ${i + 1}/${property.images.length}…`,
      5 + Math.round((i / property.images.length) * 40),
    );
    const data = await imageToBase64(property.images[i]);
    imageDataUrls.push(data);
  }

  const skippedCount = imageDataUrls.filter(d => d === null).length;
  if (skippedCount > 0) {
    report(`${skippedCount} imagen(es) no disponibles (CORS)`, 48);
    await new Promise(r => setTimeout(r, 1200));
  }

  /* ═══════════════ PAGE 1 — COVER ═══════════════ */
  report('Generando portada…', 50);

  const heroImg = imageDataUrls[0];
  const heroDims = heroImg ? await getImageDimensions(heroImg) : null;

  // ── Split layout: left navy panel (38%) + right image (62%) ──
  const LEFT_W = W * 0.38;
  const RIGHT_W = W - LEFT_W;

  // Navy left panel
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, LEFT_W, H, 'F');

  // Hero image on the right
  if (heroImg && heroDims) {
    drawCoverImage(doc, heroImg, heroDims, LEFT_W, 0, RIGHT_W, H);
    // Subtle gradient overlay from left edge of image for blending
    for (let i = 0; i < 30; i++) {
      const opacity = ((30 - i) / 30) * 0.7;
      doc.setFillColor(...NAVY);
      doc.setGState(doc.GState({ opacity }));
      doc.rect(LEFT_W + i, 0, 1, H, 'F');
    }
    doc.setGState(doc.GState({ opacity: 1 }));
  } else {
    // No image — full navy background
    doc.setFillColor(...BLUE_DARK);
    doc.rect(LEFT_W, 0, RIGHT_W, H, 'F');
  }

  // ── Left panel content ──
  const PX = 16; // panel inner padding
  let cy = 24;

  // Logo
  if (logoData && logoDims) {
    const logoH = 14;
    const logoW = logoH * (logoDims.w / logoDims.h);
    doc.addImage(logoData, 'PNG', PX, cy, logoW, logoH);
    cy += logoH + 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...BLUE_LIGHT);
    doc.text('SUN ELITE HOMES', PX, cy);
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...WHITE);
    doc.text('SUN ELITE HOMES', PX, cy);
  }

  // Thin white accent line
  cy += 10;
  accentLine(doc, PX, cy, LEFT_W - PX * 2, 0.3, BLUE_LIGHT);
  cy += 14;

  // Property title — large, elegant
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...WHITE);
  const coverMaxW = LEFT_W - PX * 2;
  const titleLines = splitText(doc, property.title, coverMaxW);
  titleLines.forEach((line: string) => {
    doc.text(line, PX, cy);
    cy += 9;
  });

  cy += 6;

  // Price — prominent
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...WHITE);
  doc.text(
    formatPrice(property.price, property.currency, property.priceFreq),
    PX,
    cy,
  );
  cy += 10;

  // Location
  const locParts = [property.town, property.province].filter(Boolean);
  if (property.location.address) locParts.unshift(property.location.address);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...BLUE_LIGHT);
  const locLines = splitText(doc, locParts.join(' · '), coverMaxW);
  locLines.forEach((line: string) => {
    doc.text(line, PX, cy);
    cy += 5;
  });

  cy += 8;
  accentLine(doc, PX, cy, LEFT_W - PX * 2, 0.3, BLUE_LIGHT);
  cy += 10;

  // Key stats in a minimal grid (icons-like: beds, baths, area)
  const miniStats: { label: string; value: string }[] = [];
  if (property.beds > 0) miniStats.push({ label: 'Dormitorios', value: String(property.beds) });
  if (property.baths > 0) miniStats.push({ label: 'Baños', value: String(property.baths) });
  if (property.surfaceArea.built > 0) miniStats.push({ label: 'Construidos', value: `${property.surfaceArea.built} m²` });
  if (property.surfaceArea.plot > 0) miniStats.push({ label: 'Parcela', value: `${property.surfaceArea.plot} m²` });
  if (property.pool) miniStats.push({ label: 'Piscina', value: 'Sí' });
  if (property.type) miniStats.push({ label: 'Tipo', value: property.type });

  const STAT_COL_W = (LEFT_W - PX * 2) / 2;
  miniStats.slice(0, 6).forEach((stat, i) => {
    const col = i % 2;
    const sx = PX + col * STAT_COL_W;

    if (col === 0 && i > 0) cy += 14;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...WHITE);
    doc.text(stat.value, sx, cy);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...BLUE_LIGHT);
    doc.text(stat.label.toUpperCase(), sx, cy + 5);
  });

  cy += 14;

  // Ref at bottom of left panel
  if (property.ref) {
    const refY = H - 14;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...BLUE_MID);
    doc.text(`Ref: ${property.ref}`, PX, refY);
  }

  // Bottom edge: thin white line
  accentLine(doc, PX, H - 10, LEFT_W - PX * 2, 0.2, BLUE_MID);

  /* ═══════════════ PAGE 2 — DETAILS ═══════════════ */
  report('Generando ficha técnica…', 60);
  doc.addPage();

  // White background is default
  let cursorY = addPageHeader(doc, W, H, MARGIN, logoData, logoDims);

  // Two-column layout
  const LEFT_COL_W = CONTENT_W * 0.48;
  const RIGHT_COL_W = CONTENT_W * 0.48;
  const COL_GAP = CONTENT_W * 0.04;
  const LEFT_X = MARGIN;
  const RIGHT_X = MARGIN + LEFT_COL_W + COL_GAP;

  // ── Left column: title + specs ──
  let leftY = cursorY;

  // Property title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...NAVY);
  const pgTitleLines = splitText(doc, property.title, LEFT_COL_W);
  pgTitleLines.forEach((line: string) => {
    doc.text(line, LEFT_X, leftY);
    leftY += 7;
  });

  leftY += 2;
  accentLine(doc, LEFT_X, leftY, 30, 0.6, NAVY);
  leftY += 8;

  // Key specs table
  const specs: [string, string][] = [];
  if (property.type) specs.push(['Tipo', property.type]);
  if (property.beds > 0) specs.push(['Dormitorios', String(property.beds)]);
  if (property.baths > 0) specs.push(['Baños', String(property.baths)]);
  if (property.rooms && property.rooms > 0)
    specs.push(['Habitaciones', String(property.rooms)]);
  if (property.ensuiteBaths && property.ensuiteBaths > 0)
    specs.push(['Baños en suite', String(property.ensuiteBaths)]);
  if (property.surfaceArea.built > 0)
    specs.push(['Sup. construida', `${property.surfaceArea.built} m²`]);
  if (property.surfaceArea.plot > 0)
    specs.push(['Sup. parcela', `${property.surfaceArea.plot} m²`]);
  if (property.surfaceArea.usable > 0)
    specs.push(['Sup. útil', `${property.surfaceArea.usable} m²`]);
  if (property.surfaceArea.habitable > 0)
    specs.push(['Sup. habitable', `${property.surfaceArea.habitable} m²`]);
  if (property.pool) specs.push(['Piscina', 'Sí']);
  if (property.hasLift) specs.push(['Ascensor', 'Sí']);
  if (property.parkingSpaces && property.parkingSpaces > 0)
    specs.push(['Plazas de garaje', String(property.parkingSpaces)]);
  if (property.hasPatio) specs.push(['Patio', 'Sí']);
  if (property.hasStudio) specs.push(['Estudio', 'Sí']);
  if (property.hasServiceRoom) specs.push(['Cuarto de servicio', 'Sí']);
  if (property.floor) specs.push(['Planta', property.floor]);
  if (property.orientation) specs.push(['Orientación', capitalize(property.orientation)]);
  if (property.heatingType)
    specs.push(['Calefacción', capitalize(property.heatingType.replace(/_/g, ' '))]);
  if (property.furnished)
    specs.push(['Amueblado', capitalize(property.furnished.replace(/_/g, ' '))]);
  if (property.buildYear) specs.push(['Año construcción', String(property.buildYear)]);
  if (property.status) specs.push(['Estado', capitalize(property.status)]);

  if (specs.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...NAVY);
    doc.text('DATOS DEL INMUEBLE', LEFT_X, leftY);
    leftY += 6;

    const ROW_H = 7;
    const VALUE_OFFSET = 40;
    specs.forEach(([label, value], i) => {
      // Alternating row background
      if (i % 2 === 0) {
        doc.setFillColor(...BLUE_ICE);
        doc.rect(LEFT_X, leftY - 4, LEFT_COL_W, ROW_H, 'F');
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...BLUE_MID);
      doc.text(label, LEFT_X + 2, leftY);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...NAVY);
      doc.text(value, LEFT_X + VALUE_OFFSET, leftY);

      leftY += ROW_H;
    });

    leftY += 4;
  }

  // Energy rating (compact)
  if (
    property.energyRating.consumption &&
    property.energyRating.consumption !== 'none'
  ) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...NAVY);
    doc.text('CALIFICACIÓN ENERGÉTICA', LEFT_X, leftY);
    leftY += 6;

    const energyLetters = [
      { letter: 'A', color: [0, 150, 64] as [number, number, number] },
      { letter: 'B', color: [25, 175, 82] as [number, number, number] },
      { letter: 'C', color: [140, 198, 63] as [number, number, number] },
      { letter: 'D', color: [255, 237, 0] as [number, number, number] },
      { letter: 'E', color: [252, 176, 64] as [number, number, number] },
      { letter: 'F', color: [240, 148, 33] as [number, number, number] },
      { letter: 'G', color: [237, 28, 36] as [number, number, number] },
    ];

    energyLetters.forEach((en, i) => {
      const barW = 18 + i * 4;
      const barH = 4.5;
      const isActive =
        property.energyRating.consumption.toLowerCase() ===
        en.letter.toLowerCase();
      doc.setFillColor(...en.color);
      doc.roundedRect(LEFT_X, leftY, barW, barH, 1, 1, 'F');
      doc.setFont('helvetica', isActive ? 'bold' : 'normal');
      doc.setFontSize(isActive ? 7 : 6);
      doc.setTextColor(255, 255, 255);
      doc.text(en.letter, LEFT_X + barW - 4, leftY + barH - 1.2);
      if (isActive) {
        doc.setFillColor(...NAVY);
        doc.triangle(
          LEFT_X + barW + 2, leftY + barH / 2,
          LEFT_X + barW + 4.5, leftY,
          LEFT_X + barW + 4.5, leftY + barH,
          'F',
        );
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(...NAVY);
        doc.text(`Consumo: ${en.letter}`, LEFT_X + barW + 6, leftY + barH - 1.2);
      }
      leftY += barH + 1;
    });
  }

  // ── Right column: description + features ──
  let rightY = cursorY;

  // Description
  if (property.description) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...NAVY);
    doc.text('DESCRIPCIÓN', RIGHT_X, rightY);
    rightY += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...BLUE_DARK);
    const descLines = splitText(doc, property.description, RIGHT_COL_W);
    // Limit to available space, overflow to next page later
    const maxDescLines = Math.floor((H - rightY - 50) / 4.5);
    const visibleLines = descLines.slice(0, maxDescLines);
    visibleLines.forEach((line: string) => {
      doc.text(line, RIGHT_X, rightY);
      rightY += 4.5;
    });

    // If description overflowed, we continue on an additional page
    if (descLines.length > maxDescLines) {
      const remainingLines = descLines.slice(maxDescLines);
      doc.addPage();
      let contY = addPageHeader(doc, W, H, MARGIN, logoData, logoDims);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...NAVY);
      doc.text('DESCRIPCIÓN (cont.)', MARGIN, contY);
      contY += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...BLUE_DARK);
      remainingLines.forEach((line: string) => {
        if (contY > H - 20) {
          addPageFooter(doc, W, H, MARGIN, property);
          doc.addPage();
          contY = addPageHeader(doc, W, H, MARGIN, logoData, logoDims);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(...BLUE_DARK);
        }
        doc.text(line, MARGIN, contY);
        contY += 4.5;
      });
      addPageFooter(doc, W, H, MARGIN, property);
    }

    rightY += 6;
  }

  // Features
  if (property.features.length > 0 && rightY < H - 30) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...NAVY);
    doc.text('CARACTERÍSTICAS', RIGHT_X, rightY);
    rightY += 6;

    const featureCols = 2;
    const featureColW = RIGHT_COL_W / featureCols;
    const FEATURE_ROW_H = 5.5;
    property.features.forEach((f, i) => {
      const col = i % featureCols;
      const fx = RIGHT_X + col * featureColW;
      if (col === 0 && i > 0) rightY += FEATURE_ROW_H;

      if (rightY > H - 20) return; // stop if no space

      // Small navy bullet
      doc.setFillColor(...NAVY);
      doc.circle(fx + 1.5, rightY - 1, 0.8, 'F');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...BLUE_DARK);
      const maxFW = featureColW - 6;
      const featureText = capitalize(f);
      const truncated = doc.getTextWidth(featureText) > maxFW
        ? featureText.slice(0, Math.floor(featureText.length * (maxFW / doc.getTextWidth(featureText)))) + '…'
        : featureText;
      doc.text(truncated, fx + 4, rightY);
    });
  }

  // Footer on details page
  addPageFooter(doc, W, H, MARGIN, property);

  /* ═══════════════ PAGE 3+ — GALLERY ═══════════════ */
  report('Generando galería…', 70);

  const galleryImages = imageDataUrls.slice(1).filter(Boolean) as string[];
  if (galleryImages.length > 0) {
    // Layout: 1 large + 2 small on first gallery page, then 2x3 grid
    let giIdx = 0;

    // ── First gallery page: 1 hero + 2 side images ──
    doc.addPage();
    const galHeaderY = addPageHeader(doc, W, H, MARGIN, logoData, logoDims);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...NAVY);
    doc.text('GALERÍA DE IMÁGENES', MARGIN, galHeaderY);

    const GAL_START_Y = galHeaderY + 6;
    const GAL_H = H - GAL_START_Y - 20; // available height for images
    const GAP = 4;

    if (galleryImages.length >= 3) {
      // Large image on left (60%), two stacked on right (40%)
      const LARGE_W = CONTENT_W * 0.6 - GAP / 2;
      const SMALL_W = CONTENT_W * 0.4 - GAP / 2;
      const SMALL_H = (GAL_H - GAP) / 2;

      // Large image
      const largeImg = galleryImages[giIdx];
      try {
        const dims = await getImageDimensions(largeImg);
        drawCoverImage(doc, largeImg, dims, MARGIN, GAL_START_Y, LARGE_W, GAL_H, 3);
      } catch {
        doc.setFillColor(...BLUE_ICE);
        doc.roundedRect(MARGIN, GAL_START_Y, LARGE_W, GAL_H, 3, 3, 'F');
      }
      giIdx++;

      // Two stacked images on right
      for (let si = 0; si < 2 && giIdx < galleryImages.length; si++) {
        const sx = MARGIN + LARGE_W + GAP;
        const sy = GAL_START_Y + si * (SMALL_H + GAP);
        try {
          const dims = await getImageDimensions(galleryImages[giIdx]);
          drawCoverImage(doc, galleryImages[giIdx], dims, sx, sy, SMALL_W, SMALL_H, 3);
        } catch {
          doc.setFillColor(...BLUE_ICE);
          doc.roundedRect(sx, sy, SMALL_W, SMALL_H, 3, 3, 'F');
        }
        giIdx++;
      }
    } else {
      // Only 1-2 images: show them side by side
      const imgW = galleryImages.length === 1 ? CONTENT_W : (CONTENT_W - GAP) / 2;
      for (let si = 0; si < galleryImages.length && giIdx < galleryImages.length; si++) {
        const sx = MARGIN + si * (imgW + GAP);
        try {
          const dims = await getImageDimensions(galleryImages[giIdx]);
          drawCoverImage(doc, galleryImages[giIdx], dims, sx, GAL_START_Y, imgW, GAL_H, 3);
        } catch {
          doc.setFillColor(...BLUE_ICE);
          doc.roundedRect(sx, GAL_START_Y, imgW, GAL_H, 3, 3, 'F');
        }
        giIdx++;
      }
    }

    addPageFooter(doc, W, H, MARGIN, property);

    report(
      `Añadiendo imágenes…`,
      75,
    );

    // ── Remaining gallery pages: 2×3 grid (landscape-optimized) ──
    const GRID_COLS = 3;
    const GRID_ROWS = 2;
    const IMGS_PER_PAGE = GRID_COLS * GRID_ROWS;

    const remaining = galleryImages.slice(giIdx);
    for (let pg = 0; pg < remaining.length; pg += IMGS_PER_PAGE) {
      doc.addPage();
      const gridHeaderY = addPageHeader(doc, W, H, MARGIN, logoData, logoDims);
      const GRID_START_Y = gridHeaderY;
      const GRID_AVAIL_H = H - GRID_START_Y - 20;
      const CELL_W = (CONTENT_W - GAP * (GRID_COLS - 1)) / GRID_COLS;
      const CELL_H = (GRID_AVAIL_H - GAP * (GRID_ROWS - 1)) / GRID_ROWS;

      const batch = remaining.slice(pg, pg + IMGS_PER_PAGE);
      for (let i = 0; i < batch.length; i++) {
        const col = i % GRID_COLS;
        const row = Math.floor(i / GRID_COLS);
        const x = MARGIN + col * (CELL_W + GAP);
        const y = GRID_START_Y + row * (CELL_H + GAP);

        try {
          const dims = await getImageDimensions(batch[i]);
          drawCoverImage(doc, batch[i], dims, x, y, CELL_W, CELL_H, 3);
        } catch {
          doc.setFillColor(...BLUE_ICE);
          doc.roundedRect(x, y, CELL_W, CELL_H, 3, 3, 'F');
        }

        report(
          `Añadiendo imagen ${giIdx + pg + i + 2}/${property.images.length}…`,
          75 + Math.round(((pg + i) / remaining.length) * 20),
        );
      }

      addPageFooter(doc, W, H, MARGIN, property);
    }
  }

  /* ═══════════════ FINALIZE ═══════════════ */
  report('Finalizando…', 95);

  const slug = property.ref || `propiedad-${property.id}`;
  const filename = `expose-${slug}.pdf`;

  if (options?.returnBlob) {
    const blob = doc.output('blob');
    const base64 = doc.output('datauristring');
    report('¡PDF generado!', 100);
    return { blob, filename, base64 };
  }

  doc.save(filename);
  report('¡PDF generado!', 100);
}

/* ── Shared page elements ──────────────────────────────── */

function addPageHeader(
  doc: jsPDF,
  W: number,
  _H: number,
  MARGIN: number,
  logoData?: string | null,
  logoDims?: { w: number; h: number } | null,
): number {
  // Slim navy top bar
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, W, 18, 'F');

  let textX = MARGIN;
  if (logoData && logoDims) {
    const logoH = 8;
    const logoW = logoH * (logoDims.w / logoDims.h);
    doc.addImage(logoData, 'PNG', MARGIN, 5, logoW, logoH);
    textX = MARGIN + logoW + 3;
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...WHITE);
  doc.text('SUN ELITE HOMES', textX, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...BLUE_LIGHT);
  doc.text('EXPOSÉ', W - MARGIN, 11, { align: 'right' });

  return 26; // cursor Y after header
}

function addPageFooter(
  doc: jsPDF,
  W: number,
  H: number,
  MARGIN: number,
  property: Property,
) {
  accentLine(doc, MARGIN, H - 14, W - MARGIN * 2, 0.25, BLUE_PALE);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(...BLUE_MID);
  doc.text('SUN ELITE HOMES  ·  www.sunelitehomes.com', MARGIN, H - 9);
  doc.text(
    `Ref: ${property.ref}  |  ${property.town}, ${property.province}`,
    MARGIN,
    H - 5.5,
  );
  doc.text(
    `Página ${doc.getCurrentPageInfo().pageNumber}`,
    W - MARGIN,
    H - 5.5,
    { align: 'right' },
  );

  doc.setFontSize(4.5);
  doc.setTextColor(...BLUE_LIGHT);
  doc.text(
    'La información contenida en este documento es orientativa y no tiene carácter contractual.',
    W / 2,
    H - 2,
    { align: 'center' },
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
