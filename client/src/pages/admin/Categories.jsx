/**
 * pages/admin/Categories.jsx — admin category management (CRUD).
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import catalogApi from "../../services/catalogApi";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Spinner from "../../components/ui/Spinner";
import Modal from "../../components/ui/Modal";
import ConfirmModal from "../../components/ui/ConfirmModal";
import ExportPdfButton from "../../components/admin/ExportPdfButton";
import { FaPlus, FaTrash, FaEdit, FaSearch } from "react-icons/fa";

const EMPTY_FORM = { name: "", description: "" };

const getId = (item) => item?._id || item?.id;

export default function Categories() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [pendingToggle, setPendingToggle] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "categories", { search, page }],
    queryFn: () => catalogApi.categories.list({ search, page, limit: 50, all: "true" }),
    keepPreviousData: true,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editing
        ? catalogApi.categories.update(getId(editing), payload)
        : catalogApi.categories.create(payload),
    onSuccess: () => {
      toast.success(editing ? "Category updated" : "Category created");
      setModalOpen(false);
      setEditing(null);
      invalidate();
    },
    onError: (err) =>
      setFormError(err?.response?.data?.error?.message || err?.message || "Save failed"),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }) => catalogApi.categories.update(id, { isActive }),
    onSuccess: () => {
      toast.success("Category updated");
      invalidate();
    },
    onError: (err) =>
      toast.error(err?.response?.data?.error?.message || err?.message || "Update failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => catalogApi.categories.remove(id),
    onSuccess: () => {
      toast.success("Category deleted");
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

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name || "", description: cat.description || "" });
    setFormError("");
    setModalOpen(true);
  };

  const handleDelete = (cat) => {
    if (window.confirm(`Delete category "${cat.name}"? This cannot be undone.`)) {
      deleteMutation.mutate(getId(cat));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError("Name is required");
      return;
    }
    setFormError("");
    saveMutation.mutate({
      name: form.name.trim(),
      description: form.description.trim() || undefined,
    });
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const categories = data?.items || [];
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Category management</h1>
          <p className="text-sm text-slate-500">Create, edit and remove catalog categories.</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportPdfButton type="categories" />
          <Button onClick={openCreate}>
            <FaPlus /> Add category
          </Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <FaSearch className="pointer-events-none absolute left-3 top-2.5 text-slate-400" />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search categories…"
          className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16 text-brand-600">
          <Spinner className="h-8 w-8" />
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          No categories yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={getId(cat)} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-800">{cat.name}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{cat.slug || "—"}</td>
                  <td className="max-w-[280px] truncate px-4 py-3 text-slate-600">
                    {cat.description || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant={cat.isActive ? "secondary" : "primary"}
                      size="sm"
                      loading={
                        toggleMutation.isLoading &&
                        toggleMutation.variables?.id === getId(cat)
                      }
                      onClick={() => setPendingToggle({ cat, isActive: !cat.isActive })}
                    >
                      {cat.isActive ? "Active" : "Inactive"}
                    </Button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(cat)}
                        aria-label={`Edit ${cat.name}`}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        loading={deleteMutation.isLoading && deleteMutation.variables === getId(cat)}
                        onClick={() => handleDelete(cat)}
                        aria-label={`Delete ${cat.name}`}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pagination.pages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm">
              <span className="text-slate-500">
                Page {pagination.page} of {pagination.pages} ({pagination.total} categories)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasPrev}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasNext}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit category" : "Add category"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name *" value={form.name} onChange={set("name")} placeholder="e.g. Fantasy" />
          <Input label="Description" value={form.description} onChange={set("description")} textarea />

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saveMutation.isLoading}>
              {editing ? "Save changes" : "Create category"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!pendingToggle}
        onClose={() => setPendingToggle(null)}
        onConfirm={() => {
          if (pendingToggle) {
            toggleMutation.mutate({
              id: getId(pendingToggle.cat),
              isActive: pendingToggle.isActive,
            });
          }
          setPendingToggle(null);
        }}
        title={pendingToggle?.isActive ? "Activate category" : "Deactivate category"}
        message={
          pendingToggle
            ? `Set category "${pendingToggle.cat.name}" to ${
                pendingToggle.isActive ? "active" : "inactive"
              }? Inactive categories are hidden from the store.`
            : ""
        }
        confirmLabel={pendingToggle?.isActive ? "Activate" : "Deactivate"}
        loading={toggleMutation.isPending}
      />
    </div>
  );
}
