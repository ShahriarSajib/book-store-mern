/**
 * pages/admin/Recommendations.jsx — recommendation management:
 * embedding status, most recommended/clicked, logs, regeneration.
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import adminApi from "../../services/adminApi";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import { formatNumber, formatDate } from "../../utils/format";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "embeddings", label: "Embeddings" },
  { key: "mostRecommended", label: "Most Recommended" },
  { key: "mostClicked", label: "Most Clicked" },
  { key: "logs", label: "Logs" },
];

const DAYS_OPTIONS = [7, 30, 90];

const PAGE_SIZE = 10;

function StatCard({ label, value, accent }) {
  const colors = {
    indigo: "border-indigo-200 dark:border-brand-700 bg-indigo-50 dark:bg-brand-900/40",
    green: "border-green-200 dark:border-emerald-700 bg-green-50 dark:bg-emerald-900/30",
    amber: "border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30",
    red: "border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/30",
  };
  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${colors[accent] || "border-slate-200 dark:border-ink-700 bg-white dark:bg-ink-800"}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-ink-600">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-ink-100">{value}</p>
    </div>
  );
}

function Pagination({ pagination, page, setPage }) {
  if (!pagination || pagination.totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-3 text-xs text-slate-500 dark:text-ink-500">
      <span>
        Page {pagination.page} of {pagination.totalPages} ({formatNumber(pagination.total)} items)
      </span>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
          Prev
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={page >= pagination.totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function OverviewTab() {
  const query = useQuery({
    queryKey: ["admin", "recommendations", "summary"],
    queryFn: () => adminApi.recommendations.summary(),
  });

  if (query.isLoading) {
    return (
      <div className="flex justify-center py-16 text-indigo-600 dark:text-brand-400">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const d = query.data || {};

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total books" value={formatNumber(d.totalBooks)} accent="indigo" />
        <StatCard label="With embedding" value={formatNumber(d.withEmbedding)} accent="green" />
        <StatCard
          label="Without embedding"
          value={formatNumber(d.withoutEmbedding)}
          accent={d.withoutEmbedding > 0 ? "amber" : "green"}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total recommendations" value={formatNumber(d.totalLogs)} accent="indigo" />
        <StatCard label="Unique users reached" value={formatNumber(d.uniqueUsers)} accent="green" />
        <StatCard label="Last 7 days" value={formatNumber(d.recentLogs)} accent="indigo" />
      </div>
    </div>
  );
}

function EmbeddingsTab() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [regenerateIds, setRegenerateIds] = useState([]);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin", "recommendations", "embeddings", { page, search, filter }],
    queryFn: () =>
      adminApi.recommendations.embeddings({
        page,
        limit: PAGE_SIZE,
        search,
        hasEmbedding: filter,
      }),
  });

  const regenMutation = useMutation({
    mutationFn: (bookIds) => adminApi.recommendations.regenerate(bookIds),
    onSuccess: (data) => {
      toast.success(`Regeneration queued for ${data.processed} book(s)`);
      setRegenerateIds([]);
      queryClient.invalidateQueries({ queryKey: ["admin", "recommendations", "embeddings"] });
    },
    onError: (err) => toast.error(err?.response?.data?.error?.message || "Failed to queue regeneration"),
  });

  const toggleSelect = (id) => {
    setRegenerateIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleAll = (ids) => {
    const allSelected = ids.every((id) => regenerateIds.includes(id));
    setRegenerateIds(allSelected ? [] : [...ids]);
  };

  const books = query.data?.books || [];
  const bookIds = books.map((b) => b._id);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search books..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="rounded-lg border border-slate-300 dark:border-ink-600 dark:bg-ink-800 dark:text-ink-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none"
        />
        <select
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-slate-300 dark:border-ink-600 dark:bg-ink-800 dark:text-ink-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none"
        >
          <option value="">All</option>
          <option value="true">With embedding</option>
          <option value="false">Without embedding</option>
        </select>
        {regenerateIds.length > 0 && (
          <Button
            size="sm"
            variant="primary"
            loading={regenMutation.isPending}
            onClick={() => regenMutation.mutate(regenerateIds)}
          >
            Regenerate {regenerateIds.length} selected
          </Button>
        )}
      </div>

      {query.isLoading ? (
        <div className="flex justify-center py-16 text-indigo-600 dark:text-brand-400">
          <Spinner className="h-8 w-8" />
        </div>
      ) : books.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-ink-700 bg-white dark:bg-ink-800 p-10 text-center text-slate-500 dark:text-ink-500">
          No books found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-ink-700 bg-white dark:bg-ink-800 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 dark:border-ink-700 bg-slate-50 dark:bg-ink-800 text-xs uppercase text-slate-500 dark:text-ink-500">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={bookIds.length > 0 && bookIds.every((id) => regenerateIds.includes(id))}
                    onChange={() => toggleAll(bookIds)}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-3">Book</th>
                <th className="px-4 py-3">Embedding</th>
                <th className="px-4 py-3 text-right">Rating</th>
                <th className="px-4 py-3 text-right">Sales</th>
                <th className="px-4 py-3 text-right">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-ink-700">
              {books.map((book) => (
                <tr key={book._id} className="hover:bg-slate-50 dark:hover:bg-ink-700">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={regenerateIds.includes(book._id)}
                      onChange={() => toggleSelect(book._id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {book.coverImage ? (
                        <img src={book.coverImage} alt="" className="h-8 w-8 rounded object-cover" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-100 dark:bg-ink-700 text-xs text-slate-400 dark:text-ink-600">
                          N/A
                        </div>
                      )}
                      <span className="truncate font-medium text-slate-800 dark:text-ink-200">{book.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {book.embeddingId ? (
                      <span className="inline-block rounded-full bg-green-100 dark:bg-emerald-900/30 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-emerald-400">
                        Has embedding
                      </span>
                    ) : (
                      <span className="inline-block rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                        No embedding
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600 dark:text-ink-400">
                    {book.averageRating ? book.averageRating.toFixed(1) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600 dark:text-ink-400">
                    {formatNumber(book.purchaseCount)}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600 dark:text-ink-400">{book.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination pagination={query.data?.pagination} page={page} setPage={setPage} />
    </div>
  );
}

function MostRecommendedTab() {
  const [page, setPage] = useState(1);
  const [days, setDays] = useState(30);

  const query = useQuery({
    queryKey: ["admin", "recommendations", "mostRecommended", { page, days }],
    queryFn: () => adminApi.recommendations.mostRecommended({ page, limit: PAGE_SIZE, days }),
  });

  const items = query.data?.items || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500 dark:text-ink-500">Period</span>
        {DAYS_OPTIONS.map((d) => (
          <Button
            key={d}
            size="sm"
            variant={days === d ? "primary" : "outline"}
            onClick={() => { setDays(d); setPage(1); }}
          >
            {d} days
          </Button>
        ))}
      </div>

      {query.isLoading ? (
        <div className="flex justify-center py-16 text-indigo-600 dark:text-brand-400">
          <Spinner className="h-8 w-8" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-ink-700 bg-white dark:bg-ink-800 p-10 text-center text-slate-500 dark:text-ink-500">
          No recommendation logs yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-ink-700 bg-white dark:bg-ink-800 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 dark:border-ink-700 bg-slate-50 dark:bg-ink-800 text-xs uppercase text-slate-500 dark:text-ink-500">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Book</th>
                <th className="px-4 py-3 text-right">Times shown</th>
                <th className="px-4 py-3 text-right">Avg score</th>
                <th className="px-4 py-3">Reasons</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-ink-700">
              {items.map((item, i) => (
                <tr key={item.book?._id || i} className="hover:bg-slate-50 dark:hover:bg-ink-700">
                  <td className="px-4 py-3 text-slate-400 dark:text-ink-600">{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {item.book?.coverImage ? (
                        <img src={item.book.coverImage} alt="" className="h-8 w-8 rounded object-cover" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-100 dark:bg-ink-700 text-xs text-slate-400 dark:text-ink-600">
                          N/A
                        </div>
                      )}
                      <span className="truncate font-medium text-slate-800 dark:text-ink-200">{item.book?.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-700 dark:text-ink-300">{item.count}</td>
                  <td className="px-4 py-3 text-right text-slate-600 dark:text-ink-400">{item.avgScore?.toFixed(2) ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {item.reasons?.slice(0, 2).map((r, ri) => (
                        <span
                          key={ri}
                          className="inline-block rounded-full bg-slate-100 dark:bg-ink-700 px-2 py-0.5 text-xs text-slate-600 dark:text-ink-400"
                        >
                          {r}
                        </span>
                      ))}
                      {item.reasons?.length > 2 && (
                        <span className="text-xs text-slate-400 dark:text-ink-600">+{item.reasons.length - 2}</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination pagination={query.data?.pagination} page={page} setPage={setPage} />
    </div>
  );
}

function MostClickedTab() {
  const [page, setPage] = useState(1);
  const [days, setDays] = useState(30);

  const query = useQuery({
    queryKey: ["admin", "recommendations", "mostClicked", { page, days }],
    queryFn: () => adminApi.recommendations.mostClicked({ page, limit: PAGE_SIZE, days }),
  });

  const items = query.data?.items || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500 dark:text-ink-500">Period</span>
        {DAYS_OPTIONS.map((d) => (
          <Button
            key={d}
            size="sm"
            variant={days === d ? "primary" : "outline"}
            onClick={() => { setDays(d); setPage(1); }}
          >
            {d} days
          </Button>
        ))}
      </div>

      {query.isLoading ? (
        <div className="flex justify-center py-16 text-indigo-600 dark:text-brand-400">
          <Spinner className="h-8 w-8" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-ink-700 bg-white dark:bg-ink-800 p-10 text-center text-slate-500 dark:text-ink-500">
          No recommendation logs yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-ink-700 bg-white dark:bg-ink-800 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 dark:border-ink-700 bg-slate-50 dark:bg-ink-800 text-xs uppercase text-slate-500 dark:text-ink-500">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Book</th>
                <th className="px-4 py-3 text-right">Unique users</th>
                <th className="px-4 py-3 text-right">Total shows</th>
                <th className="px-4 py-3 text-right">Avg score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-ink-700">
              {items.map((item, i) => (
                <tr key={item.book?._id || i} className="hover:bg-slate-50 dark:hover:bg-ink-700">
                  <td className="px-4 py-3 text-slate-400 dark:text-ink-600">{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {item.book?.coverImage ? (
                        <img src={item.book.coverImage} alt="" className="h-8 w-8 rounded object-cover" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-100 dark:bg-ink-700 text-xs text-slate-400 dark:text-ink-600">
                          N/A
                        </div>
                      )}
                      <span className="truncate font-medium text-slate-800 dark:text-ink-200">{item.book?.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-indigo-600 dark:text-brand-400">
                    {formatNumber(item.uniqueUsers)}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600 dark:text-ink-400">{formatNumber(item.totalShows)}</td>
                  <td className="px-4 py-3 text-right text-slate-600 dark:text-ink-400">{item.avgScore?.toFixed(2) ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination pagination={query.data?.pagination} page={page} setPage={setPage} />
    </div>
  );
}

function LogsTab() {
  const [page, setPage] = useState(1);
  const [bookFilter, setBookFilter] = useState("");
  const [daysFilter, setDaysFilter] = useState("");

  const query = useQuery({
    queryKey: ["admin", "recommendations", "logs", { page, bookId: bookFilter, days: daysFilter }],
    queryFn: () =>
      adminApi.recommendations.logs({
        page,
        limit: PAGE_SIZE,
        bookId: bookFilter || undefined,
        days: daysFilter || undefined,
      }),
  });

  const logs = query.data?.logs || [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Filter by book ID..."
          value={bookFilter}
          onChange={(e) => { setBookFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-slate-300 dark:border-ink-600 dark:bg-ink-800 dark:text-ink-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none"
        />
        <select
          value={daysFilter}
          onChange={(e) => { setDaysFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-slate-300 dark:border-ink-600 dark:bg-ink-800 dark:text-ink-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none"
        >
          <option value="">All time</option>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {query.isLoading ? (
        <div className="flex justify-center py-16 text-indigo-600 dark:text-brand-400">
          <Spinner className="h-8 w-8" />
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-ink-700 bg-white dark:bg-ink-800 p-10 text-center text-slate-500 dark:text-ink-500">
          No recommendation logs found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-ink-700 bg-white dark:bg-ink-800 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 dark:border-ink-700 bg-slate-50 dark:bg-ink-800 text-xs uppercase text-slate-500 dark:text-ink-500">
              <tr>
                <th className="px-4 py-3">Book</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3 text-right">Score</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-ink-700">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-ink-700">
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-ink-200">
                    {log.bookId?.title || "Unknown"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-ink-500">
                    {log.userId ? String(log.userId).slice(0, 8) + "..." : "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600 dark:text-ink-400">
                    {log.score?.toFixed(2) ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-ink-400">{log.reason || "—"}</td>
                  <td className="px-4 py-3 text-right text-xs text-slate-500 dark:text-ink-500">
                    {formatDate(log.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination pagination={query.data?.pagination} page={page} setPage={setPage} />
    </div>
  );
}

export default function Recommendations() {
  const [tab, setTab] = useState("overview");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-ink-100">Recommendations</h1>
        <p className="text-sm text-slate-500 dark:text-ink-500">
          Manage embeddings, view recommendation analytics, and monitor logs.
        </p>
      </div>

      <div className="flex gap-2">
        {TABS.map((t) => (
          <Button
            key={t.key}
            size="sm"
            variant={tab === t.key ? "primary" : "outline"}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab />}
      {tab === "embeddings" && <EmbeddingsTab />}
      {tab === "mostRecommended" && <MostRecommendedTab />}
      {tab === "mostClicked" && <MostClickedTab />}
      {tab === "logs" && <LogsTab />}
    </div>
  );
}
