/**
 * services/adminExportService.js
 * Responsibility:
 *   Generate branded PDF exports for the admin list pages (books, inventory,
 *   orders, users, categories, authors, publishers, coupons, reviews) using a
 *   shared BookVerse watermark/logo and a multi-page table renderer.
 */
import PDFDocument from "pdfkit";
import {
  BRAND,
  PAGE,
  contentWidth,
  COLORS,
  getLogoBuffer,
  drawWatermark,
  money,
  label,
  fmtDate,
} from "./pdfBranding.js";
import { Book, Order, User, Category, Author, Publisher, Coupon, Review } from "../models/index.js";

const MAX_ROWS = 2000;

const ellipsize = (s, max) => {
  const str = s || "";
  return str.length > max ? `${str.slice(0, max - 3)}…` : str;
};

const yesNo = (v) => (v ? "Yes" : "No");
const stockStatus = (stock) => {
  const n = Number(stock) || 0;
  if (n <= 0) return "Out of stock";
  if (n <= 10) return "Low";
  return "In stock";
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TYPES = {
  books: {
    title: "Book Catalog",
    headers: ["Title", "Author", "Price", "Stock", "Active", "Year"],
    widths: [170, 130, 55, 45, 45, 60],
    fetch: () =>
      Book.find()
        .sort({ title: 1 })
        .select("title authors price stock isActive publishedYear")
        .lean()
        .limit(MAX_ROWS),
    toRow: (b) => [
      ellipsize(b.title, 32),
      ellipsize((b.authors || []).join(", "), 24),
      money(b.price),
      String(b.stock ?? 0),
      yesNo(b.isActive),
      b.publishedYear ? String(b.publishedYear) : "—",
    ],
  },
  inventory: {
    title: "Inventory Report",
    headers: ["Title", "Price", "Stock", "Status"],
    widths: [250, 60, 55, 140],
    fetch: () =>
      Book.find({})
        .sort({ title: 1 })
        .select("title price stock")
        .lean()
        .limit(MAX_ROWS),
    toRow: (b) => [
      ellipsize(b.title, 46),
      money(b.price),
      String(b.stock ?? 0),
      stockStatus(b.stock),
    ],
  },
  orders: {
    title: "Orders Report",
    headers: ["Order", "Customer", "Date", "Items", "Total", "Status"],
    widths: [125, 110, 85, 40, 60, 85],
    fetch: () =>
      Order.find()
        .populate("user", "name")
        .sort({ createdAt: -1 })
        .lean()
        .limit(MAX_ROWS),
    toRow: (o) => [
      String(o.orderNumber || o._id),
      ellipsize(o.user?.name || o.shippingAddress?.recipient || "—", 20),
      o.createdAt ? fmtDate(o.createdAt) : "—",
      String(o.items?.length || 0),
      money(o.total),
      label(o.status),
    ],
  },
  users: {
    title: "Users Report",
    headers: ["Name", "Email", "Role", "Status", "Joined"],
    widths: [105, 150, 70, 110, 70],
    fetch: () =>
      User.find({})
        .sort({ createdAt: -1 })
        .select("name email role isActive isEmailVerified createdAt")
        .lean()
        .limit(MAX_ROWS),
    toRow: (u) => [
      ellipsize(u.name || "—", 20),
      ellipsize(u.email || "—", 26),
      label(u.role),
      `${u.isActive ? "Active" : "Disabled"}${u.isEmailVerified ? "" : " (unverified)"}`,
      u.createdAt ? fmtDate(u.createdAt) : "—",
    ],
  },
  categories: {
    title: "Categories Report",
    headers: ["Name", "Slug", "Active", "Description"],
    widths: [130, 130, 55, 190],
    fetch: () => Category.find({}).sort({ name: 1 }).lean().limit(MAX_ROWS),
    toRow: (c) => [
      ellipsize(c.name || "—", 24),
      ellipsize(c.slug || "—", 24),
      yesNo(c.isActive),
      ellipsize(c.description || "—", 34),
    ],
  },
  authors: {
    title: "Authors Report",
    headers: ["Name", "Born", "Country", "Active"],
    widths: [200, 70, 150, 85],
    fetch: () => Author.find({}).sort({ name: 1 }).lean().limit(MAX_ROWS),
    toRow: (a) => [
      ellipsize(a.name || "—", 36),
      a.bornYear ? String(a.bornYear) : "—",
      ellipsize(a.country || "—", 26),
      yesNo(a.isActive),
    ],
  },
  publishers: {
    title: "Publishers Report",
    headers: ["Name", "Country", "Website"],
    widths: [200, 120, 185],
    fetch: () => Publisher.find({}).sort({ name: 1 }).lean().limit(MAX_ROWS),
    toRow: (p) => [
      ellipsize(p.name || "—", 36),
      ellipsize(p.country || "—", 22),
      ellipsize(p.website || "—", 32),
    ],
  },
  coupons: {
    title: "Coupons Report",
    headers: ["Code", "Type", "Value", "Min", "Uses", "Expires", "Active"],
    widths: [85, 70, 70, 60, 60, 90, 70],
    fetch: () => Coupon.find({}).sort({ createdAt: -1 }).lean().limit(MAX_ROWS),
    toRow: (c) => [
      ellipsize(c.code || "—", 15),
      label(c.type),
      c.type === "percent" ? `${c.value}%` : money(c.value),
      c.minOrder ? money(c.minOrder) : "—",
      `${c.usedCount ?? 0}/${c.usageLimit ?? "∞"}`,
      c.expiresAt ? fmtDate(c.expiresAt) : "—",
      yesNo(c.isActive),
    ],
  },
  reviews: {
    title: "Reviews Report",
    headers: ["Book", "Reviewer", "Rating", "Approved", "Date"],
    widths: [180, 110, 50, 80, 85],
    fetch: () =>
      Review.find({})
        .populate("user", "name")
        .populate("book", "title")
        .sort({ createdAt: -1 })
        .lean()
        .limit(MAX_ROWS),
    toRow: (r) => [
      ellipsize(r.book?.title || "—", 32),
      ellipsize(r.user?.name || (EMAIL_REGEX.test(String(r.user)) ? String(r.user) : "—"), 20),
      String(r.rating ?? "—"),
      r.isApproved ? "Approved" : "Pending",
      r.createdAt ? fmtDate(r.createdAt) : "—",
    ],
  },
};

const VALID_TYPES = Object.keys(TYPES);

/**
 * Draw a small branded page header (logo + title + generated date).
 */
function drawDocHeader(doc, logo, title) {
  const M = PAGE.margin;
  doc.rect(0, 0, PAGE.width, 6).fill(COLORS.brand);

  doc.image(logo, M, 24, { width: 26 });
  doc.font("Helvetica-Bold").fontSize(16).fillColor(COLORS.ink).text(BRAND.name, M + 36, 26);
  doc.font("Helvetica").fontSize(8).fillColor(COLORS.lightGray).text(BRAND.tagline, M + 36, 46);

  doc.font("Helvetica-Bold").fontSize(18).fillColor(COLORS.brandDark).text(
    title,
    PAGE.width - M,
    22,
    { align: "right", width: 220 }
  );
  doc.font("Helvetica").fontSize(8.5).fillColor(COLORS.gray).text(
    `Generated ${fmtDate(new Date())}`,
    PAGE.width - M,
    44,
    { align: "right", width: 220 }
  );

  doc.moveTo(M, 62).lineTo(PAGE.width - M, 62).strokeColor(COLORS.border).lineWidth(1).stroke();
}

/**
 * Render a multi-page table with a repeated header and watermark on each page.
 */
function renderTable(doc, logo, headers, widths, rows) {
  const M = PAGE.margin;
  const rowH = 20;
  let y = 78;

  const drawHeaderRow = () => {
    doc.rect(M, y, contentWidth(), rowH).fill(COLORS.softBlue);
    doc.font("Helvetica-Bold").fontSize(8).fillColor(COLORS.ink);
    let x = M;
    headers.forEach((h, i) => {
      doc.text(
        h,
        x + 4,
        y + 6.5,
        { width: widths[i] - 6, lineBreak: false, align: widths[i] < 55 ? "right" : "left" }
      );
      x += widths[i];
    });
    y += rowH;
  };

  drawHeaderRow();

  for (let r = 0; r < rows.length; r += 1) {
    // start a new page when running low
    if (y + rowH > PAGE.height - 60) {
      doc.addPage();
      drawWatermark(doc, logo);
      y = 40;
      drawHeaderRow();
    }

    if (r % 2 === 1) {
      doc.rect(M, y, contentWidth(), rowH).fill(COLORS.soft);
    }

    doc.font("Helvetica").fontSize(8).fillColor(COLORS.ink);
    let x = M;
    rows[r].forEach((cell, i) => {
      doc.text(
        String(cell),
        x + 4,
        y + 6.5,
        { width: widths[i] - 6, lineBreak: false, align: widths[i] < 55 ? "right" : "left" }
      );
      x += widths[i];
    });

    doc.moveTo(M, y + rowH).lineTo(PAGE.width - M, y + rowH).strokeColor(COLORS.border).lineWidth(0.4).stroke();
    y += rowH;
  }
}

/**
 * Generate a branded PDF export Buffer for the named admin list type.
 */
export async function exportListPdf(type) {
  if (!VALID_TYPES.includes(type)) {
    const err = new Error(`Unsupported export type: ${type}`);
    err.statusCode = 400;
    throw err;
  }
  const cfg = TYPES[type];
  const logo = await getLogoBuffer();
  const rows = cfg.fetch ? (await cfg.fetch()).map(cfg.toRow) : [];
  const doc = new PDFDocument({ size: "A4", margin: 0, bufferPages: true });

  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("error", reject);
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    doc.font("Helvetica").fontSize(9).fillColor(COLORS.ink);
    drawWatermark(doc, logo);
    drawDocHeader(doc, logo, cfg.title);
    renderTable(doc, logo, cfg.headers, cfg.widths, rows);

    doc.font("Helvetica-Bold").fontSize(9).fillColor(COLORS.ink).text(
      `Total ${rows.length}${rows.length >= MAX_ROWS ? ` (capped at ${MAX_ROWS})` : ""}`,
      PAGE.margin,
      PAGE.height - 40,
      { align: "center", width: contentWidth() }
    );

    doc.end();
  });
}
