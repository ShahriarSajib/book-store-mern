/**
 * pages/admin/Coupons.jsx — admin coupon management (CRUD).
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import adminApi from "../../services/adminApi";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Spinner from "../../components/ui/Spinner";
import Modal from "../../components/ui/Modal";
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import { formatCurrency, formatDate } from "../../utils/format";

const EMPTY_FORM = {
  code: "",
  description: "",
  type: "percent",
  value: "",
  minOrder: "",
  maxDiscount: "",
  usageLimit: "",
  expiresAt: "",
  isActive: true,
};

const getId = (item) => item?._id || item?.id;

function toLocalInput(value) {
  if (!value) return "";
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toForm(coupon) {
  return {
    code: coupon.code || "",
    description: coupon.description || "",
    type: coupon.type || "percent",
    value: coupon.value ?? "",
    minOrder: coupon.minOrder ?? "",
    maxDiscount: coupon.maxDiscount ?? "",
    usageLimit: coupon.usageLimit ?? "",
    expiresAt: toLocalInput(coupon.expiresAt),
    isActive: coupon.isActive ?? true,
  };
}

function toPayload(form) {
  const num = (v) => (v === "" || v === null || v === undefined ? undefined : Number(v));
  return {
    code: form.code.trim().toUpperCase(),
    description: form.description.trim() || undefined,
    type: form.type,
    value: num(form.value),
    minOrder: num(form.minOrder),
    maxDiscount: num(form.maxDiscount),
    usageLimit: num(form.usageLimit),
    expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
    isActive: Boolean(form.isActive),
  };
}

function couponValue(coupon) {
  if (coupon.type === "fixed") return formatCurrency(coupon.value);
  if (coupon.type === "percent") return `${coupon.value}%`;
  return "—";
}

function couponUsage(coupon) {
  if (!coupon.usageLimit) return "∞";
  return `${coupon.usedCount ?? 0}/${coupon.usageLimit}`;
}

export default function Coupons() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "coupons"],
    queryFn: () => adminApi.coupons.list(),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editing
        ? adminApi.coupons.update(getId(editing), payload)
        : adminApi.coupons.create(payload),
    onSuccess: () => {
      toast.success(editing ? "Coupon updated" : "Coupon created");
      setModalOpen(false);
      setEditing(null);
      invalidate();
    },
    onError: (err) =>
      setFormError(err?.response?.data?.error?.message || err?.message || "Save failed"),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }) => adminApi.coupons.update(id, { isActive }),
    onSuccess: () => {
      toast.success("Coupon updated");
      invalidate();
    },
    onError: (err) =>
      toast.error(err?.response?.data?.error?.message || err?.message || "Update failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.coupons.remove(id),
    onSuccess: () => {
      toast.success("Coupon deleted");
      invalidate();
    },
    onError: (err) =>
      toast.error(err?.response?.data?.error?.message || err?.message || "Delete failed"),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (coupon) => {
    setEditing(coupon);
    setForm(toForm(coupon));
    setFormError("");
    setModalOpen(true);
  };

  const handleDelete = (coupon) => {
    if (window.confirm(`Delete coupon "${coupon.code}"? This cannot be undone.`)) {
      deleteMutation.mutate(getId(coupon));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.code.trim()) {
      setFormError("Code is required");
      return;
    }
    if (form.value === "" || Number(form.value) <= 0) {
      setFormError("Value is required and must be greater than 0");
      return;
    }
    setFormError("");
    saveMutation.mutate(toPayload(form));
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const coupons = data?.coupons || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Coupon management</h1>
          <p className="text-sm text-slate-500">Create, edit and remove discount coupons.</p>
        </div>
        <Button onClick={openCreate}>
          <FaPlus /> Create coupon
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16 text-indigo-600">
          <Spinner className="h-8 w-8" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          No coupons yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">Min order</th>
                <th className="px-4 py-3">Usage</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={getId(coupon)} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <p className="font-mono text-sm font-semibold text-slate-800">{coupon.code}</p>
                    <p className="max-w-[200px] truncate text-xs text-slate-500">
                      {coupon.description || ""}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{coupon.type}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{couponValue(coupon)}</td>
                  <td className="px-4 py-3 text-slate-600">{formatCurrency(coupon.minOrder)}</td>
                  <td className="px-4 py-3 text-slate-600">{couponUsage(coupon)}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(coupon.expiresAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          coupon.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {coupon.isActive ? "Active" : "Inactive"}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        loading={
                          toggleMutation.isLoading &&
                          toggleMutation.variables?.id === getId(coupon)
                        }
                        onClick={() =>
                          toggleMutation.mutate({
                            id: getId(coupon),
                            isActive: !coupon.isActive,
                          })
                        }
                      >
                        {coupon.isActive ? "Disable" : "Enable"}
                      </Button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(coupon)}
                        aria-label={`Edit ${coupon.code}`}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        loading={
                          deleteMutation.isLoading && deleteMutation.variables === getId(coupon)
                        }
                        onClick={() => handleDelete(coupon)}
                        aria-label={`Delete ${coupon.code}`}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit coupon" : "Create coupon"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Code *" value={form.code} onChange={set("code")} placeholder="e.g. SUMMER10" />
          <Input label="Description" value={form.description} onChange={set("description")} />
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Type</span>
              <select
                value={form.type}
                onChange={set("type")}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="percent">Percent (%)</option>
                <option value="fixed">Fixed ($)</option>
              </select>
            </label>
            <Input
              label="Value *"
              type="number"
              step="0.01"
              min="0"
              value={form.value}
              onChange={set("value")}
              placeholder={form.type === "percent" ? "e.g. 10" : "e.g. 5"}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Minimum order"
              type="number"
              step="0.01"
              min="0"
              value={form.minOrder}
              onChange={set("minOrder")}
            />
            <Input
              label="Max discount"
              type="number"
              step="0.01"
              min="0"
              value={form.maxDiscount}
              onChange={set("maxDiscount")}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Usage limit"
              type="number"
              min="0"
              value={form.usageLimit}
              onChange={set("usageLimit")}
            />
            <Input
              label="Expires at"
              type="datetime-local"
              value={form.expiresAt}
              onChange={set("expiresAt")}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Active
          </label>

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saveMutation.isLoading}>
              {editing ? "Save changes" : "Create coupon"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
