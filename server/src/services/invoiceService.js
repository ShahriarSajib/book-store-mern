/**
 * services/invoiceService.js
 * Responsibility:
 *   Generate a branded, watermark-laden PDF invoice for an order using pdfkit,
 *   with the BookVerse logo (rasterized from the SVG via sharp) as a
 *   translucent watermark.
 */
import PDFDocument from "pdfkit";
import { BRAND as STORE, PAGE, COLORS as C, getLogoBuffer, drawWatermark, money, label, fmtDateTime } from "./pdfBranding.js";

function ellipsize(s, max = 46) {
  const str = s || "";
  return str.length > max ? `${str.slice(0, max - 1)}…` : str;
}

function drawHeader(doc, order, logo) {
  const PW = PAGE.width;
  const M = PAGE.margin;

  // top accent bar
  doc.rect(0, 0, PW, 6).fill(C.brand);

  // logo + brand
  doc.image(logo, M, 28, { width: 34 });
  doc.font("Helvetica-Bold").fontSize(20).fillColor(C.ink).text("BookVerse", M + 46, 30);
  doc.font("Helvetica").fontSize(9).fillColor(C.gray).text(STORE.tagline, M + 46, 53);

  // INVOICE label (right)
  doc.font("Helvetica-Bold").fontSize(26).fillColor(C.brandDark).text(
    "INVOICE",
    PW - M - 240,
    26,
    { align: "right", width: 240 }
  );
  doc.font("Helvetica").fontSize(10).fillColor(C.gray).text(
    order.orderNumber,
    PW - M - 240,
    55,
    { align: "right", width: 240 }
  );

  // store line + divider
  doc.font("Helvetica").fontSize(8.5).fillColor(C.lightGray).text(
    `${STORE.address}  |  ${STORE.email}  |  ${STORE.phone}`,
    M,
    92
  );
  doc.moveTo(M, 112).lineTo(PW - M, 112).strokeColor(C.border).lineWidth(1).stroke();
}

function drawBillToAndMeta(doc, order) {
  const M = 45;
  const top = 128;
  const metaLeft = 300;

  // Bill to (left)
  doc.font("Helvetica-Bold").fontSize(9).fillColor(C.brandDark).text("BILL TO", M, top);
  const customer = order.user || {};
  const name = customer.name || order.shippingAddress?.recipient || "—";
  const email = customer.email || "";
  const ship = order.shippingAddress || {};

  let y = top + 16;
  doc.font("Helvetica-Bold").fontSize(11).fillColor(C.ink);
  doc.text(name, M, y);
  y += 15;
  doc.font("Helvetica").fontSize(9).fillColor(C.gray);
  if (email) {
    doc.text(email, M, y);
    y += 12;
  }
  if (ship.phone) {
    doc.text(ship.phone, M, y);
    y += 12;
  }
  const addrLine = [ship.street, ship.city, ship.state, ship.postalCode, ship.country]
    .filter(Boolean)
    .join(", ");
  if (addrLine) {
    doc.text(addrLine, M, y, { width: 240 });
  }

  // Invoice meta (right)
  const meta = [
    ["Invoice date", fmtDateTime(order.createdAt)],
    ["Order placed", fmtDateTime(order.createdAt)],
    ["Downloaded", fmtDateTime(new Date())],
    ["Order status", label(order.status)],
    ["Payment", `${label(order.paymentStatus)} · ${label(order.paymentMethod)}`],
  ];

  doc.font("Helvetica-Bold").fontSize(9).fillColor(C.brandDark).text(
    "INVOICE DETAILS",
    metaLeft,
    top,
    { width: 250, align: "right" }
  );

  let my = top + 16;
  for (const [k, v] of meta) {
    doc.font("Helvetica").fontSize(9).fillColor(C.lightGray).text(
      k,
      metaLeft,
      my,
      { width: 118, align: "left", lineBreak: false }
    );
    doc.font("Helvetica").fontSize(9).fillColor(C.ink).text(
      v,
      metaLeft + 108,
      my,
      { width: 142, align: "right", lineBreak: false }
    );
    my += 14;
  }
}

function drawItemsTable(doc, order) {
  const M = 45;
  const PW = 595.28;
  const xL = M;
  const xQ = 300;
  const xP = 410;
  const xA = PW - M; // 550

  const headers = [
    ["Item", xL, "left"],
    ["Qty", xQ, "right"],
    ["Unit price", xP, "right"],
    ["Amount", xA, "right"],
  ];

  const headY = 262;
  const rowH = 28;

  // header
  doc.rect(M, headY, PW - M * 2, 24).fill(C.softBlue);
  doc.font("Helvetica-Bold").fontSize(9).fillColor(C.ink);
  for (const [text, x, align] of headers) {
    doc.text(text, x, headY + 7, { align, width: align === "left" ? 200 : 80, lineBreak: false });
  }

  // rows
  let y = headY + 24;
  order.items.forEach((item, i) => {
    if (i % 2 === 1) doc.rect(M, y, PW - M * 2, rowH).fill(C.soft);

    doc.font("Helvetica").fontSize(9).fillColor(C.ink);
    doc.text(ellipsize(item.title), xL, y + 9, { width: 210, lineBreak: false });
    doc.text(String(item.quantity), xQ, y + 9, { align: "right", width: 60, lineBreak: false });
    doc.text(money(item.price), xP, y + 9, { align: "right", width: 70, lineBreak: false });
    doc.text(money((item.quantity || 0) * item.price), xA - 80, y + 9, {
      align: "right",
      width: 80,
      lineBreak: false,
    });

    // row border
    doc.moveTo(M, y + rowH).lineTo(PW - M, y + rowH).strokeColor(C.border).lineWidth(0.6).stroke();
    y += rowH;
  });

  // bottom border
  doc.moveTo(M, y).lineTo(PW - M, y).strokeColor(C.brand).lineWidth(1.4).stroke();
  return y;
}

function drawTotals(doc, order, itemsBottom) {
  const M = 45;
  const PW = 595.28;
  const colLeft = PW - M - 200;
  const colRight = PW - M;

  const rows = [
    ["Subtotal", money(order.subtotal), false],
    ["Discount", `-${money(order.coupon?.discount || 0)}`, false],
    ["Shipping", money(order.shipping), false],
    ["Tax", money(order.tax), false],
  ];

  let y = itemsBottom + 16;
  for (const [k, v] of rows) {
    doc.font("Helvetica").fontSize(10).fillColor(C.gray).text(k, colLeft, y, {
      width: 130,
      align: "left",
      lineBreak: false,
    });
    doc.font("Helvetica").fontSize(10).fillColor(C.ink).text(v, colRight - 80, y, {
      width: 80,
      align: "right",
      lineBreak: false,
    });
    y += 18;
  }

  // total
  doc.moveTo(colLeft, y).lineTo(colRight, y).strokeColor(C.ink).lineWidth(1).stroke();
  const totalY = y + 10;
  doc.font("Helvetica-Bold").fontSize(12).fillColor(C.ink).text("TOTAL", colLeft, totalY, {
    width: 130,
    align: "left",
    lineBreak: false,
  });
  doc.font("Helvetica-Bold").fontSize(13).fillColor(C.brandDark).text(money(order.total), colRight - 80, totalY, {
    width: 80,
    align: "right",
    lineBreak: false,
  });

  return totalY;
}

function drawFooter(doc) {
  const PW = 595.28;
  const M = 45;
  const startY = 720;
  const contentWidth = PW - M * 2;

  doc.moveTo(M, startY).lineTo(PW - M, startY).strokeColor(C.border).lineWidth(1).stroke();

  doc.font("Helvetica-Bold").fontSize(11).fillColor(C.ink).text(
    "Thank you for shopping with BookVerse!",
    M,
    startY + 24,
    { align: "center", width: contentWidth }
  );
  doc.font("Helvetica").fontSize(9).fillColor(C.gray).text(
    `Questions about your order? Reach us at ${STORE.email} or ${STORE.phone}.`,
    M,
    startY + 42,
    { align: "center", width: contentWidth }
  );

  // bottom accent bar
  doc.rect(0, 835.89, PW, 6).fill(C.brand);
}

/**
 * Generate a Buffer containing a branded PDF invoice for the given order.
 * `order` should have a populated `user` (name/email) for customer details.
 */
export async function generateInvoicePdf(order) {
  const logo = await getLogoBuffer();
  const doc = new PDFDocument({ size: "A4", margin: 0, bufferPages: true });

  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("error", reject);
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    drawWatermark(doc, logo);
    drawHeader(doc, order, logo);
    drawBillToAndMeta(doc, order);
    const itemsBottom = drawItemsTable(doc, order);
    drawTotals(doc, order, itemsBottom);
    drawFooter(doc);

    doc.end();
  });
}
