/**
 * controllers/orderController.js — checkout, list, cancel, invoice.
 */
import catchAsync from "../utils/catchAsync.js";
import * as orderService from "../services/orderService.js";
import { generateInvoicePdf } from "../services/invoiceService.js";

const createOrder = catchAsync(async (req, res) => {
  const { order, isOnlinePayment } = await orderService.createOrder(req.user.id, req.body);
  res.status(201).json({ order, isOnlinePayment });
});

const listOrders = catchAsync(async (req, res) => {
  res.json(await orderService.listOrders(req.user.id, req.query));
});

const getOrder = catchAsync(async (req, res) => {
  res.json({ order: await orderService.getOrder(req.user.id, req.params.id) });
});

const getTracking = catchAsync(async (req, res) => {
  res.json({ tracking: await orderService.getTracking(req.user.id, req.params.id) });
});

const cancelOrder = catchAsync(async (req, res) => {
  res.json({ order: await orderService.cancelOrder(req.user.id, req.params.id, req.body.reason) });
});

const reorder = catchAsync(async (req, res) => {
  res.json(await orderService.reorder(req.user.id, req.params.id));
});

const downloadInvoice = catchAsync(async (req, res) => {
  const order = await orderService.getOrder(req.user.id, req.params.id);
  if (order.user) await order.populate("user", "name email");
  const pdf = await generateInvoicePdf(order);
  res.setHeader("Content-Type", "application/pdf; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="invoice-${order.orderNumber}.pdf"`);
  res.send(pdf);
});

export { createOrder, listOrders, getOrder, getTracking, cancelOrder, reorder, downloadInvoice };
