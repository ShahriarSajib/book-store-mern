/**
 * controllers/couponController.js — coupon apply + admin CRUD.
 */
const catchAsync = require("../utils/catchAsync");
const couponService = require("../services/couponService");

const apply = catchAsync(async (req, res) => {
  const { code, subtotal } = req.body;
  res.json(await couponService.apply(code, subtotal || 0));
});

const list = catchAsync(async (_req, res) => {
  res.json({ coupons: await couponService.listAdmin() });
});

const create = catchAsync(async (req, res) => {
  const coupon = await couponService.create(req.body);
  res.status(201).json({ coupon });
});

const update = catchAsync(async (req, res) => {
  res.json({ coupon: await couponService.update(req.params.id, req.body) });
});

const remove = catchAsync(async (req, res) => {
  res.json(await couponService.remove(req.params.id));
});

module.exports = { apply, list, create, update, remove };
