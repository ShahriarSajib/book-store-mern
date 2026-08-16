/**
 * pages/customer/Addresses.jsx — address book management.
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import userApi from "../../services/userApi";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Spinner from "../../components/ui/Spinner";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import { FaEdit, FaMapMarkerAlt, FaPlus, FaTrash } from "react-icons/fa";

const EMPTY_FORM = {
  label: "",
  recipient: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  isDefault: false,
};

function toForm(address) {
  return {
    label: address.label || "",
    recipient: address.recipient || "",
    phone: address.phone || "",
    street: address.street || "",
    city: address.city || "",
    state: address.state || "",
    postalCode: address.postalCode || "",
    country: address.country || "",
    isDefault: Boolean(address.isDefault),
  };
}

export default function Addresses() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["addresses"],
    queryFn: userApi.getAddresses,
    keepPreviousData: true,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["addresses"] });

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editing ? userApi.updateAddress(editing._id || editing.id, payload) : userApi.addAddress(payload),
    onSuccess: () => {
      toast.success(editing ? "Address updated" : "Address added");
      setModalOpen(false);
      setEditing(null);
      setForm(EMPTY_FORM);
      invalidate();
    },
    onError: (err) => {
      const details = err?.response?.data?.details;
      setFormError(
        details
          ? Object.values(details).join(" · ")
          : err?.response?.data?.error?.message || "Could not save address"
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (addressId) => userApi.deleteAddress(addressId),
    onSuccess: () => {
      toast.success("Address deleted");
      invalidate();
    },
    onError: (err) => toast.error(err?.response?.data?.error?.message || "Could not delete address"),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (address) => {
    setEditing(address);
    setForm(toForm(address));
    setFormError("");
    setModalOpen(true);
  };

  const handleDelete = (address) => {
    if (window.confirm("Delete this address?")) {
      deleteMutation.mutate(address._id || address.id);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.recipient.trim() || !form.phone.trim() || !form.street.trim() || !form.city.trim()) {
      setFormError("Recipient, phone, street and city are required");
      return;
    }
    setFormError("");
    saveMutation.mutate(form);
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  if (isLoading) {
    return (
      <div className="flex justify-center py-24 text-brand-600">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-10 text-center">
        <p className="font-medium text-red-700">Failed to load your addresses</p>
        <p className="text-sm text-red-600">{error?.response?.data?.error?.message || error?.message}</p>
      </div>
    );
  }

  const addresses = data?.addresses || [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Saved addresses</h1>
          <p className="text-sm text-ink-500">Manage the addresses used for delivery.</p>
        </div>
        <Button onClick={openCreate}>
          <FaPlus /> Add address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <EmptyState
          icon={FaMapMarkerAlt}
          title="No saved addresses"
          description="Add an address to speed up checkout."
          actionLabel="Add address"
          onAction={openCreate}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <article
              key={address._id || address.id}
              className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ink-900">{address.label || "Address"}</span>
                  {address.isDefault && (
                    <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                      Default
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(address)}
                    aria-label={`Edit ${address.label || "address"}`}
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(address)}
                    aria-label={`Delete ${address.label || "address"}`}
                    className="text-red-500 hover:bg-red-50 hover:text-red-600"
                  >
                    <FaTrash />
                  </Button>
                </div>
              </div>
              <p className="mt-2 text-sm font-medium text-ink-800">{address.recipient}</p>
              <p className="text-sm text-ink-600">{address.phone}</p>
              <p className="text-sm text-ink-600">{address.street}</p>
              <p className="text-sm text-ink-600">
                {address.city}, {address.state} {address.postalCode}, {address.country}
              </p>
            </article>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit address" : "Add address"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Label" value={form.label} onChange={set("label")} placeholder="Home, Work…" />
            <Input label="Recipient *" value={form.recipient} onChange={set("recipient")} placeholder="Full name" />
          </div>
          <Input label="Phone *" value={form.phone} onChange={set("phone")} placeholder="Phone number" />
          <Input label="Street address *" value={form.street} onChange={set("street")} placeholder="Street address" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="City *" value={form.city} onChange={set("city")} />
            <Input label="State / Province" value={form.state} onChange={set("state")} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Postal code" value={form.postalCode} onChange={set("postalCode")} />
            <Input label="Country" value={form.country} onChange={set("country")} placeholder="Country" />
          </div>
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
              className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
            />
            Set as default address
          </label>

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saveMutation.isLoading}>
              {editing ? "Save changes" : "Add address"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
