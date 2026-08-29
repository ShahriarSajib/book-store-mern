/**
 * pages/admin/Books.jsx — admin book management (CRUD).
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import bookApi from "../../services/bookApi";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Spinner from "../../components/ui/Spinner";
import Modal from "../../components/ui/Modal";
import ConfirmModal from "../../components/ui/ConfirmModal";
import ExportPdfButton from "../../components/admin/ExportPdfButton";
import { FaSearch, FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import { formatCurrency } from "../../utils/format";

const PAGE_SIZE = 10;

const EMPTY_FORM = {
  title: "",
  subtitle: "",
  authors: "",
  categories: "",
  publisher: "",
  language: "en",
  isbn10: "",
  isbn13: "",
  coverImage: "",
  description: "",
  publishedYear: "",
  pages: "",
  price: "",
  stock: "",
  isActive: true,
};

function toForm(book) {
  return {
    title: book.title || "",
    subtitle: book.subtitle || "",
    authors: book.authors?.join("; ") || "",
    categories: book.categories?.join("; ") || "",
    publisher: book.publisher || "",
    language: book.language || "en",
    isbn10: book.isbn10 || "",
    isbn13: book.isbn13 || "",
    coverImage: book.coverImage || "",
    description: book.description || "",
    publishedYear: book.publishedYear ?? "",
    pages: book.pages ?? "",
    price: book.price ?? "",
    stock: book.stock ?? "",
    isActive: book.isActive ?? true,
  };
}

function parseListField(value) {
  return value
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

function toPayload(form) {
  const num = (v) => (v === "" || v === null || v === undefined ? undefined : Number(v));
  return {
    title: form.title.trim(),
    subtitle: form.subtitle.trim() || undefined,
    authors: parseListField(form.authors),
    categories: parseListField(form.categories),
    publisher: form.publisher.trim() || undefined,
    language: form.language.trim() || undefined,
    isbn10: form.isbn10.trim() || undefined,
    isbn13: form.isbn13.trim() || undefined,
    coverImage: form.coverImage.trim() || undefined,
    description: form.description.trim() || undefined,
    publishedYear: num(form.publishedYear),
    pages: num(form.pages),
    price: num(form.price),
    stock: num(form.stock),
    isActive: Boolean(form.isActive),
  };
}

export default function AdminBooks() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["admin", "books", { search, page }],
    queryFn: () => bookApi.list({ q: search || undefined, page, limit: PAGE_SIZE, sort: "newest", facet: "false" }),
    keepPreviousData: true,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "books"] });

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editing ? bookApi.update(editing.id || editing._id, payload) : bookApi.create(payload),
    onSuccess: () => {
      toast.success(editing ? "Book updated" : "Book created");
      setModalOpen(false);
      setEditing(null);
      invalidate();
    },
    onError: (err) => {
      const details = err?.response?.data?.details;
      if (details) {
        setFormError(Object.values(details).join(" · "));
      } else {
        setFormError(err?.response?.data?.error?.message || "Save failed");
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => bookApi.remove(id),
    onSuccess: () => {
      toast.success("Book deleted");
      invalidate();
    },
    onError: (err) => toast.error(err?.response?.data?.error?.message || "Delete failed"),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (book) => {
    setEditing(book);
    setForm(toForm(book));
    setFormError("");
    setModalOpen(true);
  };

  const handleDelete = (book) => {
    setDeleteTarget(book);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setFormError("Title is required");
      return;
    }
    setFormError("");
    saveMutation.mutate(toPayload(form));
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const books = data?.books || [];
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-ink-100">Book management</h1>
          <p className="text-sm text-slate-500 dark:text-ink-500">Create, edit and remove catalog books.</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportPdfButton type="books" />
          <Button onClick={openCreate}>
            <FaPlus /> Add book
          </Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <FaSearch className="pointer-events-none absolute left-3 top-2.5 text-slate-400 dark:text-ink-600" />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search books…"
          className="w-full rounded-lg border border-slate-300 dark:border-ink-600 dark:bg-ink-800 dark:text-ink-200 py-2 pl-9 pr-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16 text-indigo-600 dark:text-brand-400">
          <Spinner className="h-8 w-8" />
        </div>
      ) : books.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-ink-700 bg-white dark:bg-ink-800 p-10 text-center text-slate-500 dark:text-ink-500">
          No books match your search.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-ink-700 bg-white dark:bg-ink-800 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-ink-800 text-xs uppercase tracking-wide text-slate-400 dark:text-ink-600">
              <tr>
                <th className="px-4 py-3">Book</th>
                <th className="px-4 py-3">Author</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id || book._id} className="border-t border-slate-100 dark:border-ink-700">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-9 shrink-0 items-center justify-center overflow-hidden rounded bg-slate-50 dark:bg-ink-800">
                        {book.coverImage ? (
                          <img src={book.coverImage} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xs text-slate-300 dark:text-ink-600">—</span>
                        )}
                      </div>
                      <div className="max-w-[220px]">
                        <p className="truncate font-medium text-slate-800 dark:text-ink-200">{book.title}</p>
                        <p className="truncate text-xs text-slate-500 dark:text-ink-500">{book.publishedYear || ""}</p>
                      </div>
                    </div>
                  </td>
                  <td className="max-w-[180px] truncate px-4 py-3 text-slate-600 dark:text-ink-400">
                    {book.authors?.join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-ink-200">{formatCurrency(book.price)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${(book.stock ?? 0) > 0 ? "bg-green-100 dark:bg-emerald-900/30 text-green-700 dark:text-emerald-400" : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"}`}>
                      {book.stock ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-ink-400">
                    {book.averageRating ? book.averageRating.toFixed(1) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(book)} aria-label={`Edit ${book.title}`}>
                        <FaEdit />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        loading={deleteMutation.isPending && deleteMutation.variables === (book.id || book._id)}
                        onClick={() => handleDelete(book)}
                        aria-label={`Delete ${book.title}`}
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
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-ink-700 px-4 py-3 text-sm">
              <span className="text-slate-500 dark:text-ink-500">
                Page {pagination.page} of {pagination.pages} ({pagination.total} books)
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={!pagination.hasPrev} onClick={() => setPage((p) => p - 1)}>
                  Prev
                </Button>
                <Button variant="outline" size="sm" disabled={!pagination.hasNext} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      {isFetching && !isLoading && <p className="text-xs text-slate-400 dark:text-ink-600">Updating…</p>}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit book" : "Add book"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Title *" value={form.title} onChange={set("title")} placeholder="e.g. The Hobbit" />
          <Input label="Subtitle" value={form.subtitle} onChange={set("subtitle")} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Authors (separate with ;)" value={form.authors} onChange={set("authors")} />
            <Input label="Categories (separate with ;)" value={form.categories} onChange={set("categories")} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Publisher" value={form.publisher} onChange={set("publisher")} />
            <Input label="Language" value={form.language} onChange={set("language")} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="ISBN-13" value={form.isbn13} onChange={set("isbn13")} />
            <Input label="ISBN-10" value={form.isbn10} onChange={set("isbn10")} />
          </div>
          <Input label="Cover image URL" value={form.coverImage} onChange={set("coverImage")} />
          <Input label="Description" value={form.description} onChange={set("description")} textarea />
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Year" type="number" value={form.publishedYear} onChange={set("publishedYear")} />
            <Input label="Pages" type="number" value={form.pages} onChange={set("pages")} />
            <Input label="Price" type="number" step="0.01" value={form.price} onChange={set("price")} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Stock" type="number" value={form.stock} onChange={set("stock")} />
            <label className="flex items-center gap-2 pt-6 text-sm text-slate-700 dark:text-ink-300">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 dark:border-ink-600 dark:bg-ink-800 dark:text-ink-200 text-indigo-600 dark:text-brand-400 focus:ring-indigo-500"
              />
              Active (visible in store)
            </label>
          </div>

          {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saveMutation.isPending}>
              {editing ? "Save changes" : "Create book"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.id || deleteTarget._id);
            setDeleteTarget(null);
          }
        }}
        title="Delete book"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
