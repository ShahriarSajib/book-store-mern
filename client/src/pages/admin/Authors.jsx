/**
 * pages/admin/Authors.jsx — admin author management (CRUD).
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

const EMPTY_FORM = { name: "", bio: "", bornYear: "", country: "" };

const getId = (item) => item?._id || item?.id;

export default function Authors() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "authors"],
    queryFn: () => catalogApi.authors.list(),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "authors"] });

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editing
        ? catalogApi.authors.update(getId(editing), payload)
        : catalogApi.authors.create(payload),
    onSuccess: () => {
      toast.success(editing ? "Author updated" : "Author created");
      setModalOpen(false);
      setEditing(null);
      invalidate();
    },
    onError: (err) =>
      setFormError(err?.response?.data?.error?.message || err?.message || "Save failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => catalogApi.authors.remove(id),
    onSuccess: () => {
      toast.success("Author deleted");
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

  const openEdit = (author) => {
    setEditing(author);
    setForm({
      name: author.name || "",
      bio: author.bio || "",
      bornYear: author.bornYear ?? "",
      country: author.country || "",
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleDelete = (author) => {
    if (window.confirm(`Delete author "${author.name}"? This cannot be undone.`)) {
      deleteMutation.mutate(getId(author));
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
      bio: form.bio.trim() || undefined,
      bornYear: form.bornYear === "" ? undefined : Number(form.bornYear),
      country: form.country.trim() || undefined,
    });
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const authors = data?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Author management</h1>
          <p className="text-sm text-slate-500">Create, edit and remove catalog authors.</p>
        </div>
        <Button onClick={openCreate}>
          <FaPlus /> Add author
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16 text-indigo-600">
          <Spinner className="h-8 w-8" />
        </div>
      ) : authors.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          No authors yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Born</th>
                <th className="px-4 py-3">Country</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {authors.map((author) => (
                <tr key={getId(author)} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                        {author.name.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <p className="font-medium text-slate-800">{author.name}</p>
                        <p className="max-w-[260px] truncate text-xs text-slate-500">
                          {author.bio || "—"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{author.bornYear ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{author.country || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(author)}
                        aria-label={`Edit ${author.name}`}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        loading={
                          deleteMutation.isLoading && deleteMutation.variables === getId(author)
                        }
                        onClick={() => handleDelete(author)}
                        aria-label={`Delete ${author.name}`}
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
        title={editing ? "Edit author" : "Add author"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name *" value={form.name} onChange={set("name")} placeholder="e.g. J.R.R. Tolkien" />
          <Input label="Bio" value={form.bio} onChange={set("bio")} textarea />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Born year"
              type="number"
              value={form.bornYear}
              onChange={set("bornYear")}
              placeholder="e.g. 1892"
            />
            <Input label="Country" value={form.country} onChange={set("country")} placeholder="e.g. United Kingdom" />
          </div>

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saveMutation.isLoading}>
              {editing ? "Save changes" : "Create author"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
