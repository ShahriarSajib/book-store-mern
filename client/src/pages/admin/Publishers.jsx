/**
 * pages/admin/Publishers.jsx — admin publisher management (CRUD).
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import catalogApi from "../../services/catalogApi";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Spinner from "../../components/ui/Spinner";
import Modal from "../../components/ui/Modal";
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";

const EMPTY_FORM = { name: "", country: "", website: "" };

const getId = (item) => item?._id || item?.id;

export default function Publishers() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "publishers"],
    queryFn: () => catalogApi.publishers.list(),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "publishers"] });

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editing
        ? catalogApi.publishers.update(getId(editing), payload)
        : catalogApi.publishers.create(payload),
    onSuccess: () => {
      toast.success(editing ? "Publisher updated" : "Publisher created");
      setModalOpen(false);
      setEditing(null);
      invalidate();
    },
    onError: (err) =>
      setFormError(err?.response?.data?.error?.message || err?.message || "Save failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => catalogApi.publishers.remove(id),
    onSuccess: () => {
      toast.success("Publisher deleted");
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

  const openEdit = (publisher) => {
    setEditing(publisher);
    setForm({
      name: publisher.name || "",
      country: publisher.country || "",
      website: publisher.website || "",
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleDelete = (publisher) => {
    if (window.confirm(`Delete publisher "${publisher.name}"? This cannot be undone.`)) {
      deleteMutation.mutate(getId(publisher));
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
      country: form.country.trim() || undefined,
      website: form.website.trim() || undefined,
    });
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const publishers = data?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Publisher management</h1>
          <p className="text-sm text-slate-500">Create, edit and remove catalog publishers.</p>
        </div>
        <Button onClick={openCreate}>
          <FaPlus /> Add publisher
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16 text-indigo-600">
          <Spinner className="h-8 w-8" />
        </div>
      ) : publishers.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          No publishers yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Country</th>
                <th className="px-4 py-3">Website</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {publishers.map((publisher) => (
                <tr key={getId(publisher)} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-800">{publisher.name}</td>
                  <td className="px-4 py-3 text-slate-600">{publisher.country || "—"}</td>
                  <td className="max-w-[240px] truncate px-4 py-3">
                    {publisher.website ? (
                      <a
                        href={publisher.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 hover:underline"
                      >
                        {publisher.website}
                      </a>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(publisher)}
                        aria-label={`Edit ${publisher.name}`}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        loading={
                          deleteMutation.isLoading &&
                          deleteMutation.variables === getId(publisher)
                        }
                        onClick={() => handleDelete(publisher)}
                        aria-label={`Delete ${publisher.name}`}
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
        title={editing ? "Edit publisher" : "Add publisher"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name *" value={form.name} onChange={set("name")} placeholder="e.g. HarperCollins" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Country" value={form.country} onChange={set("country")} placeholder="e.g. United States" />
            <Input label="Website" value={form.website} onChange={set("website")} placeholder="https://…" />
          </div>

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saveMutation.isLoading}>
              {editing ? "Save changes" : "Create publisher"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
