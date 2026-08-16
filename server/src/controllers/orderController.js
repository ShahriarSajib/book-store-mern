/**
 * controllers/orderController.js — checkout, list, cancel, invoice.
 */
const catchAsync = require("../utils/catchAsync");
const orderService = require("../services/orderService");

const createOrder = catchAsync(async (req, res) => {
  const order = await orderService.createOrder(req.user.id, req.body);
  res.status(201).json({ order });
});

const listOrders = catchAsync(async (req, res) => {
  res.json(await orderService.listOrders(req.user.id, req.query));
});

const getOrder = catchAsync(async (req, res) => {
  res.json({ order: await orderService.getOrder(req.user.id, req.params.id) });
});

const cancelOrder = catchAsync(async (req, res) => {
  res.json({ order: await orderService.cancelOrder(req.user.id, req.params.id, req.body.reason) });
});

const downloadInvoice = catchAsync(async (req, res) => {
  const order = await orderService.getOrder(req.user.id, req.params.id);
  const csv = orderService.invoiceRows(order);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="invoice-${order.orderNumber}.csv"`);
  res.send(csv);
});

module.exports = { createOrder, listOrders, getOrder, cancelOrder, downloadInvoice };
