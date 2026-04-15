/**
 * Exposé PDF Generator — Elegant portrait real-estate brochure
 * Uses jsPDF to produce a branded property exposé on white background.
 */
import jsPDF from 'jspdf';
import type { Property } from '../data/properties';
import { formatPrice } from '../data/properties';
import logoUrl from '../assets/logo.png';

/* ── Brand palette (white background, navy & gold accents) ── */
const NAVY: [number, number, number] = [15, 23, 42];       // #0F172A
const BLUE_DARK: [number, number, number] = [30, 41, 59];   // #1E293B
const BLUE_MID: [number, number, number] = [71, 85, 105];   // #475569
const BLUE_LIGHT: [number, number, number] = [148, 163, 184]; // #94A3B8
const BLUE_PALE: [number, number, number] = [226, 232, 240]; // #E2E8F0
const BLUE_ICE: [number, number, number] = [241, 245, 249];  // #F1F5F9
const GOLD: [number, number, number] = [184, 152, 42];      // #B8982A

/* ── Portrait A4 constants ─────────────────────────────── */
const PW = 210; // portrait width
const PH = 297; // portrait height
const SITE_URL = 'https://www.sunelitehomes.com';

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

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = PW;
  const H = PH;
  const MARGIN = 16;
  const CONTENT_W = W - MARGIN * 2;

  // Public URL for the property
  const publicUrl = `${SITE_URL}/inmueble/${property.id}`;

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

  // ── Navy blue header strip with logo + company name ──
  const HEADER_STRIP_H = 22;
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, W, HEADER_STRIP_H, 'F');
  // Gold accent line at bottom of strip
  doc.setFillColor(...GOLD);
  doc.rect(0, HEADER_STRIP_H, W, 0.8, 'F');

  const logoAreaY = 4;
  if (logoData && logoDims) {
    const logoH = 14;
    const logoW = logoH * (logoDims.w / logoDims.h);
    doc.addImage(logoData, 'PNG', MARGIN, logoAreaY, logoW, logoH);
    // Company name to the right of the logo
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text('SunEliteHomes', MARGIN + logoW + 4, logoAreaY + logoH / 2 + 2);
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('SunEliteHomes', MARGIN, 14);
  }
  let cy = HEADER_STRIP_H + 2;

  // ── Hero image (full width, large) ──
  const HERO_Y = 38;
  const HERO_H = 110;
  if (heroImg && heroDims) {
    drawCoverImage(doc, heroImg, heroDims, MARGIN, HERO_Y, CONTENT_W, HERO_H, 4);
    // Subtle gradient overlay at bottom for text readability
    for (let i = 0; i < 25; i++) {
      const opacity = (i / 25) * 0.5;
      doc.setFillColor(0, 0, 0);
      doc.setGState(doc.GState({ opacity }));
      doc.rect(MARGIN, HERO_Y + HERO_H - 25 + i, CONTENT_W, 1, 'F');
    }
    doc.setGState(doc.GState({ opacity: 1 }));
  } else {
    doc.setFillColor(...BLUE_ICE);
    doc.roundedRect(MARGIN, HERO_Y, CONTENT_W, HERO_H, 4, 4, 'F');
  }

  // ── Ref badge on top-right of image ──
  if (property.ref) {
    const refText = `Ref: ${property.ref}`;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    const refW = doc.getTextWidth(refText) + 8;
    const refX = MARGIN + CONTENT_W - refW - 4;
    const refY = HERO_Y + 4;
    doc.setFillColor(255, 255, 255);
    doc.setGState(doc.GState({ opacity: 0.85 }));
    doc.roundedRect(refX, refY, refW, 6, 2, 2, 'F');
    doc.setGState(doc.GState({ opacity: 1 }));
    doc.setTextColor(...NAVY);
    doc.text(refText, refX + 4, refY + 4.2);
  }

  // ── Content below hero ──
  cy = HERO_Y + HERO_H + 12;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...NAVY);
  const titleLines = splitText(doc, property.title, CONTENT_W);
  titleLines.forEach((line: string) => {
    doc.text(line, MARGIN, cy);
    cy += 10;
  });

  cy += 2;

  // Gold accent line under title
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.8);
  doc.line(MARGIN, cy, MARGIN + 40, cy);
  cy += 10;

  // Price
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...GOLD);
  doc.text(
    formatPrice(property.price, property.currency, property.priceFreq),
    MARGIN,
    cy,
  );
  cy += 9;

  // Location
  const locParts = [property.town, property.province].filter(Boolean);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...BLUE_MID);
  doc.text(locParts.join(' · '), MARGIN, cy);
  cy += 12;

  // Key stats in a row of boxes
  const miniStats: { label: string; value: string }[] = [];
  if (property.beds > 0) miniStats.push({ label: 'Dormitorios', value: String(property.beds) });
  if (property.baths > 0) miniStats.push({ label: 'Baños', value: String(property.baths) });
  if (property.surfaceArea.built > 0) miniStats.push({ label: 'Construidos', value: `${property.surfaceArea.built} m²` });
  if (property.surfaceArea.plot > 0) miniStats.push({ label: 'Parcela', value: `${property.surfaceArea.plot} m²` });
  if (property.pool) miniStats.push({ label: 'Piscina', value: 'Sí' });
  if (property.type) miniStats.push({ label: 'Tipo', value: property.type });

  const statCount = Math.min(miniStats.length, 4);
  if (statCount > 0) {
    const STAT_W = (CONTENT_W - (statCount - 1) * 4) / statCount;
    const STAT_H = 20;
    miniStats.slice(0, 4).forEach((stat, i) => {
      const sx = MARGIN + i * (STAT_W + 4);
      // Stat box with light background
      doc.setFillColor(...BLUE_ICE);
      doc.roundedRect(sx, cy, STAT_W, STAT_H, 2, 2, 'F');

      // Value
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(...NAVY);
      doc.text(stat.value, sx + STAT_W / 2, cy + 9, { align: 'center' });

      // Label
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(...BLUE_MID);
      doc.text(stat.label.toUpperCase(), sx + STAT_W / 2, cy + 15, { align: 'center' });
    });
    cy += STAT_H + 6;
  }

  // ── "Ver propiedad online" link ──
  if (cy < H - 30) {
    cy = Math.max(cy, H - 40);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...BLUE_MID);
    doc.text('Ver esta propiedad online:', MARGIN, cy);
    doc.setTextColor(...GOLD);
    doc.setFont('helvetica', 'bold');
    const linkY = cy;
    const labelW = doc.getTextWidth('Ver esta propiedad online: ');
    doc.textWithLink(publicUrl, MARGIN + labelW, linkY, { url: publicUrl });
    // Underline the link
    const linkW = doc.getTextWidth(publicUrl);
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.2);
    doc.line(MARGIN + labelW, linkY + 0.8, MARGIN + labelW + linkW, linkY + 0.8);
  }

  // Cover footer
  addPageFooter(doc, W, H, MARGIN, property);

  /* ═══════════════ PAGE 2 — DETAILS ═══════════════ */
  report('Generando ficha técnica…', 60);
  doc.addPage();

  let cursorY = addPageHeader(doc, W, H, MARGIN, logoData, logoDims);

  // ── Property title (smaller) ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...NAVY);
  const pgTitleLines = splitText(doc, property.title, CONTENT_W);
  pgTitleLines.forEach((line: string) => {
    doc.text(line, MARGIN, cursorY);
    cursorY += 7;
  });

  cursorY += 2;
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, cursorY, MARGIN + 30, cursorY);
  cursorY += 8;

  // ── Specs table ──
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
    doc.text('DATOS DEL INMUEBLE', MARGIN, cursorY);
    cursorY += 6;

    // Two-column specs table
    const TABLE_W = CONTENT_W;
    const COL_W = TABLE_W / 2;
    const ROW_H = 7;
    const VALUE_OFFSET = 38;

    specs.forEach(([label, value], i) => {
      const col = i < Math.ceil(specs.length / 2) ? 0 : 1;
      const rowInCol = col === 0 ? i : i - Math.ceil(specs.length / 2);
      const sx = MARGIN + col * COL_W;
      const sy = cursorY + rowInCol * ROW_H;

      // Alternating row background
      if (rowInCol % 2 === 0) {
        doc.setFillColor(...BLUE_ICE);
        doc.rect(sx, sy - 4, COL_W - 2, ROW_H, 'F');
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...BLUE_MID);
      doc.text(label, sx + 2, sy);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...NAVY);
      doc.text(value, sx + VALUE_OFFSET, sy);
    });

    const specRows = Math.ceil(specs.length / 2);
    cursorY += specRows * ROW_H + 6;
  }

  // ── Energy rating ──
  if (
    property.energyRating.consumption &&
    property.energyRating.consumption !== 'none'
  ) {
    if (cursorY > H - 60) {
      addPageFooter(doc, W, H, MARGIN, property);
      doc.addPage();
      cursorY = addPageHeader(doc, W, H, MARGIN, logoData, logoDims);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...NAVY);
    doc.text('CALIFICACIÓN ENERGÉTICA', MARGIN, cursorY);
    cursorY += 6;

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
      doc.roundedRect(MARGIN, cursorY, barW, barH, 1, 1, 'F');
      doc.setFont('helvetica', isActive ? 'bold' : 'normal');
      doc.setFontSize(isActive ? 7 : 6);
      doc.setTextColor(255, 255, 255);
      doc.text(en.letter, MARGIN + barW - 4, cursorY + barH - 1.2);
      if (isActive) {
        doc.setFillColor(...NAVY);
        doc.triangle(
          MARGIN + barW + 2, cursorY + barH / 2,
          MARGIN + barW + 4.5, cursorY,
          MARGIN + barW + 4.5, cursorY + barH,
          'F',
        );
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(...NAVY);
        doc.text(`Consumo: ${en.letter}`, MARGIN + barW + 6, cursorY + barH - 1.2);
      }
      cursorY += barH + 1;
    });
    cursorY += 4;
  }

  // ── Description ──
  if (property.description) {
    if (cursorY > H - 40) {
      addPageFooter(doc, W, H, MARGIN, property);
      doc.addPage();
      cursorY = addPageHeader(doc, W, H, MARGIN, logoData, logoDims);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...NAVY);
    doc.text('DESCRIPCIÓN', MARGIN, cursorY);
    cursorY += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...BLUE_DARK);
    const descLines = splitText(doc, property.description, CONTENT_W);
    descLines.forEach((line: string) => {
      if (cursorY > H - 22) {
        addPageFooter(doc, W, H, MARGIN, property);
        doc.addPage();
        cursorY = addPageHeader(doc, W, H, MARGIN, logoData, logoDims);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...BLUE_DARK);
      }
      doc.text(line, MARGIN, cursorY);
      cursorY += 4.5;
    });
    cursorY += 6;
  }

  // ── Zone description ──
  if (property.descriptionZone) {
    if (cursorY > H - 40) {
      addPageFooter(doc, W, H, MARGIN, property);
      doc.addPage();
      cursorY = addPageHeader(doc, W, H, MARGIN, logoData, logoDims);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...NAVY);
    doc.text('LA ZONA', MARGIN, cursorY);
    cursorY += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...BLUE_DARK);
    const zoneLines = splitText(doc, property.descriptionZone, CONTENT_W);
    zoneLines.forEach((line: string) => {
      if (cursorY > H - 22) {
        addPageFooter(doc, W, H, MARGIN, property);
        doc.addPage();
        cursorY = addPageHeader(doc, W, H, MARGIN, logoData, logoDims);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...BLUE_DARK);
      }
      doc.text(line, MARGIN, cursorY);
      cursorY += 4.5;
    });
    cursorY += 6;
  }

  // ── Features ──
  if (property.features.length > 0) {
    if (cursorY > H - 30) {
      addPageFooter(doc, W, H, MARGIN, property);
      doc.addPage();
      cursorY = addPageHeader(doc, W, H, MARGIN, logoData, logoDims);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...NAVY);
    doc.text('CARACTERÍSTICAS', MARGIN, cursorY);
    cursorY += 6;

    const featureCols = 2;
    const featureColW = CONTENT_W / featureCols;
    const FEATURE_ROW_H = 5.5;
    property.features.forEach((f, i) => {
      const col = i % featureCols;
      const fx = MARGIN + col * featureColW;
      if (col === 0 && i > 0) cursorY += FEATURE_ROW_H;

      if (cursorY > H - 22) {
        addPageFooter(doc, W, H, MARGIN, property);
        doc.addPage();
        cursorY = addPageHeader(doc, W, H, MARGIN, logoData, logoDims);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(...BLUE_DARK);
      }

      // Gold bullet
      doc.setFillColor(...GOLD);
      doc.circle(fx + 1.5, cursorY - 1, 0.8, 'F');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...BLUE_DARK);
      const maxFW = featureColW - 6;
      const featureText = capitalize(f);
      const truncated = doc.getTextWidth(featureText) > maxFW
        ? featureText.slice(0, Math.floor(featureText.length * (maxFW / doc.getTextWidth(featureText)))) + '…'
        : featureText;
      doc.text(truncated, fx + 4, cursorY);
    });
    cursorY += FEATURE_ROW_H + 4;
  }

  // Footer on details page
  addPageFooter(doc, W, H, MARGIN, property);

  /* ═══════════════ PAGE 3+ — GALLERY ═══════════════ */
  report('Generando galería…', 70);

  const galleryImages = imageDataUrls.slice(1).filter(Boolean) as string[];
  if (galleryImages.length > 0) {
    let giIdx = 0;

    // ── First gallery page: 1 large + 2 side images ──
    doc.addPage();
    let galHeaderY = addPageHeader(doc, W, H, MARGIN, logoData, logoDims);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...NAVY);
    doc.text('GALERÍA DE IMÁGENES', MARGIN, galHeaderY);

    const GAL_START_Y = galHeaderY + 6;
    const GAL_H = H - GAL_START_Y - 22;
    const GAP = 4;

    if (galleryImages.length >= 3) {
      // Large image on top (60% height), two side by side below
      const LARGE_H = GAL_H * 0.58;
      const SMALL_H = GAL_H - LARGE_H - GAP;
      const SMALL_W = (CONTENT_W - GAP) / 2;

      // Large image
      try {
        const dims = await getImageDimensions(galleryImages[giIdx]);
        drawCoverImage(doc, galleryImages[giIdx], dims, MARGIN, GAL_START_Y, CONTENT_W, LARGE_H, 3);
      } catch {
        doc.setFillColor(...BLUE_ICE);
        doc.roundedRect(MARGIN, GAL_START_Y, CONTENT_W, LARGE_H, 3, 3, 'F');
      }
      giIdx++;

      // Two images below
      for (let si = 0; si < 2 && giIdx < galleryImages.length; si++) {
        const sx = MARGIN + si * (SMALL_W + GAP);
        const sy = GAL_START_Y + LARGE_H + GAP;
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
      // Only 1-2 images: show them stacked or full
      const imgH = galleryImages.length === 1 ? GAL_H : (GAL_H - GAP) / 2;
      for (let si = 0; si < galleryImages.length && giIdx < galleryImages.length; si++) {
        const sy = GAL_START_Y + si * (imgH + GAP);
        try {
          const dims = await getImageDimensions(galleryImages[giIdx]);
          drawCoverImage(doc, galleryImages[giIdx], dims, MARGIN, sy, CONTENT_W, imgH, 3);
        } catch {
          doc.setFillColor(...BLUE_ICE);
          doc.roundedRect(MARGIN, sy, CONTENT_W, imgH, 3, 3, 'F');
        }
        giIdx++;
      }
    }

    addPageFooter(doc, W, H, MARGIN, property);

    report('Añadiendo imágenes…', 75);

    // ── Remaining gallery pages: 2×2 grid (portrait-optimized) ──
    const GRID_COLS = 2;
    const GRID_ROWS = 2;
    const IMGS_PER_PAGE = GRID_COLS * GRID_ROWS;

    const remaining = galleryImages.slice(giIdx);
    for (let pg = 0; pg < remaining.length; pg += IMGS_PER_PAGE) {
      doc.addPage();
      const gridHeaderY = addPageHeader(doc, W, H, MARGIN, logoData, logoDims);
      const GRID_START_Y = gridHeaderY;
      const GRID_AVAIL_H = H - GRID_START_Y - 22;
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
  // Navy blue header strip
  const stripH = 14;
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, W, stripH, 'F');
  // Gold accent line at bottom
  doc.setFillColor(...GOLD);
  doc.rect(0, stripH, W, 0.5, 'F');

  let textX = MARGIN;
  const logoY = 3;
  if (logoData && logoDims) {
    const logoH = 8;
    const logoW = logoH * (logoDims.w / logoDims.h);
    doc.addImage(logoData, 'PNG', MARGIN, logoY, logoW, logoH);
    textX = MARGIN + logoW + 3;
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('SunEliteHomes', textX, logoY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...GOLD);
  doc.text('EXPOSÉ', W - MARGIN, logoY + 6, { align: 'right' });

  return stripH + 4; // cursor Y after header
}

function addPageFooter(
  doc: jsPDF,
  W: number,
  H: number,
  MARGIN: number,
  property: Property,
) {
  // Top line
  doc.setDrawColor(...BLUE_PALE);
  doc.setLineWidth(0.25);
  doc.line(MARGIN, H - 16, W - MARGIN, H - 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(...BLUE_MID);
  doc.text('SUN ELITE HOMES  ·  www.sunelitehomes.com', MARGIN, H - 11);
  doc.text(
    `Ref: ${property.ref}  |  ${property.town}, ${property.province}`,
    MARGIN,
    H - 7.5,
  );
  doc.text(
    `Página ${doc.getCurrentPageInfo().pageNumber}`,
    W - MARGIN,
    H - 7.5,
    { align: 'right' },
  );

  // Gold bottom bar
  doc.setFillColor(...GOLD);
  doc.rect(0, H - 3, W, 3, 'F');

  doc.setFontSize(4.5);
  doc.setTextColor(...BLUE_LIGHT);
  doc.text(
    'La información contenida en este documento es orientativa y no tiene carácter contractual.',
    W / 2,
    H - 4,
    { align: 'center' },
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
