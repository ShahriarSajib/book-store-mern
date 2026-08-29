/**
 * services/pdfBranding.js
 * Responsibility:
 *   Shared BookVerse PDF branding: brand metadata, color palette, logo
 *   rasterization (SVG -> PNG via sharp) and translucent watermark rendering.
 */
import path from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const BRAND = {
  name: "BookVerse",
  tagline: "Way of Life",
  email: "hello@bookverse.com",
  phone: "+1 (555) 012-3456",
  address: "55 Reader's Row, Book District, Portland, OR 97201",
};

export const PAGE = {
  width: 595.28, // A4 width (pt)
  height: 841.89, // A4 height (pt)
  margin: 45,
};

export const contentWidth = () => PAGE.width - PAGE.margin * 2;

export const COLORS = {
  brand: "#3B82F6",
  brandDark: "#1D4ED8",
  softBlue: "#EFF6FF",
  ink: "#18181B",
  gray: "#6B7280",
  lightGray: "#9CA3AF",
  soft: "#F8FAFC",
  border: "#E5E7EB",
  white: "#FFFFFF",
};

let logoBufferPromise = null;
export function getLogoBuffer() {
  if (!logoBufferPromise) {
    const svgPath = path.resolve(__dirname, "../../../client/public/favicon.svg");
    const svg = readFileSync(svgPath);
    logoBufferPromise = sharp(svg).resize(320, 320).png().toBuffer();
  }
  return logoBufferPromise;
}

/**
 * Draw a large, faintly-visible, rotated brand logo across the page body.
 */
export function drawWatermark(doc, logo) {
  const cx = PAGE.width / 2;
  const cy = PAGE.height / 2;
  doc.save();
  doc.translate(cx, cy);
  doc.rotate(-28);
  doc.image(logo, -190, -190, { width: 380, opacity: 0.055 });
  doc.restore();
}

export const money = (n) => `$${(Number(n) || 0).toFixed(2)}`;
export const label = (s) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ") : "—";
export const fmtDateTime = (d) =>
  new Date(d).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
export const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
