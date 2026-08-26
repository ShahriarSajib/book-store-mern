/**
 * pages/admin/Analytics.jsx — sales, inventory, recommendation analytics.
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import adminApi from "../../services/adminApi";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import { useTheme } from "../../context/ThemeContext";
import { formatCurrency, formatNumber } from "../../utils/format";

const DAYS_OPTIONS = [7, 30, 90];

const TABS = [
  { key: "sales", label: "Sales" },
  { key: "inventory", label: "Inventory" },
  { key: "recommendations", label: "Recommendations" },
];

const PIE_COLORS = ["#059669", "#ed7624", "#b45309", "#e11d48", "#6366f1", "#0891b2"];

const labelize = (value) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : value);

function ChartTooltip({ active, payload, label }) {
  const { theme } = useTheme();
  const bg = theme === "dark" ? "#1e293b" : "#fff";
  const border = theme === "dark" ? "#334155" : "#e2e8f0";
  const text = theme === "dark" ? "#f1f5f9" : "#0f172a";
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{ background: bg, border: `1px solid ${border}`, color: text }}
      className="rounded-lg px-3 py-2 text-xs shadow-lg"
    >
      <p className="font-semibold">{labelize(String(label))}</p>
      {payload.map((p) => (
        <p key={p.dataKey}>
          {p.dataKey === "revenue" ? formatCurrency(p.value) : formatNumber(p.value)}
        </p>
      ))}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-ink-700 dark:bg-ink-100">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-ink-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-ink-50">{value}</p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-ink-700 dark:bg-ink-100">
      <h3 className="mb-3 text-sm font-semibold text-slate-800 dark:text-ink-200">{title}</h3>
      {children}
    </div>
  );
}

function EmptyText({ children = "No data yet." }) {
  return <p className="py-4 text-sm text-slate-400 dark:text-ink-400">{children}</p>;
}

export default function Analytics() {
  const [tab, setTab] = useState("sales");
  const [days, setDays] = useState(30);

  const salesQuery = useQuery({
    queryKey: ["admin", "analytics", "sales", { days }],
    queryFn: () => adminApi.analytics.sales({ days }),
  });
  const inventoryQuery = useQuery({
    queryKey: ["admin", "analytics", "inventory"],
    queryFn: () => adminApi.analytics.inventory(),
  });
  const recsQuery = useQuery({
    queryKey: ["admin", "analytics", "recommendations"],
    queryFn: () => adminApi.analytics.recommendations(),
  });

  const sales = salesQuery.data;
  const inventory = inventoryQuery.data;
  const recs = recsQuery.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-sm text-slate-500">Sales, inventory and recommendation insights.</p>
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

      {tab === "sales" && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Range</span>
            {DAYS_OPTIONS.map((d) => (
              <Button
                key={d}
                size="sm"
                variant={days === d ? "primary" : "outline"}
                onClick={() => setDays(d)}
              >
                {d} days
              </Button>
            ))}
          </div>

          {salesQuery.isLoading ? (
            <div className="flex justify-center py-16 text-brand-600">
              <Spinner className="h-8 w-8" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label="Revenue" value={formatCurrency(sales.summary?.revenue)} />
                <StatCard label="Orders" value={formatNumber(sales.summary?.orders)} />
                <StatCard label="Items sold" value={formatNumber(sales.summary?.items)} />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Section title="Sales over time">
                  {sales.series?.length ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sales.series} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                          <XAxis
                            dataKey="_id"
                            tickFormatter={(v) => labelize(String(v))}
                            tick={{ fontSize: 11 }}
                          />
                          <YAxis tick={{ fontSize: 11 }} width={60} tickFormatter={(v) => `$${v}`} />
                          <Tooltip content={<ChartTooltip />} />
                          <Bar dataKey="revenue" fill="#059669" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <EmptyText>No sales data for this range.</EmptyText>
                  )}
                </Section>

                <Section title="Top books">
                  {sales.topBooks?.length ? (
                    <div className="space-y-2">
                      {sales.topBooks.map((b) => (
                        <div
                          key={b._id || b.id}
                          className="flex items-center justify-between gap-3 text-sm"
                        >
                          <p className="truncate text-slate-700">{b.title}</p>
                          <p className="shrink-0 text-xs text-slate-500">
                            {formatNumber(b.qty)} sold · {formatCurrency(b.revenue)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyText />
                  )}
                </Section>
              </div>

              <Section title="Orders by status">
                {sales.statusBreakdown?.length ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sales.statusBreakdown.map((s) => ({
                            name: labelize(s._id),
                            value: s.count,
                          }))}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {sales.statusBreakdown.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyText />
                )}
              </Section>
            </div>
          )}
        </div>
      )}

      {tab === "inventory" && (
        <div className="space-y-6">
          {inventoryQuery.isLoading ? (
            <div className="flex justify-center py-16 text-brand-600">
              <Spinner className="h-8 w-8" />
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label="Total books" value={formatNumber(inventory.totals?.books)} />
                <StatCard label="Total stock" value={formatNumber(inventory.totals?.totalStock)} />
                <StatCard label="Inventory value" value={formatCurrency(inventory.totals?.value)} />
              </div>

              <Section title="Low stock">
                {inventory.lowStock?.length ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={inventory.lowStock.map((b) => ({ name: b.title, stock: b.stock }))}
                        layout="vertical"
                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                      >
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tick={{ fontSize: 11 }}
                          width={120}
                          tickFormatter={(v) => (v.length > 18 ? v.slice(0, 18) + "…" : v)}
                        />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar dataKey="stock" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyText>All books are well stocked.</EmptyText>
                )}
              </Section>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
                <strong>{formatNumber(inventory.outOfStock)}</strong> books out of stock.
              </div>
            </>
          )}
        </div>
      )}

      {tab === "recommendations" && (
        <div className="space-y-6">
          {recsQuery.isLoading ? (
            <div className="flex justify-center py-16 text-brand-600">
              <Spinner className="h-8 w-8" />
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <StatCard
                  label="Average rating"
                  value={recs.reviewStats?.avg ? recs.reviewStats.avg.toFixed(1) : "—"}
                />
                <StatCard label="Total reviews" value={formatNumber(recs.reviewStats?.count)} />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Section title="Top rated">
                  {recs.topRated?.length ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={recs.topRated.map((b) => ({
                            name: b.title,
                            rating: b.averageRating ?? 0,
                          }))}
                          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                        >
                          <XAxis
                            dataKey="name"
                            tick={{ fontSize: 10 }}
                            tickFormatter={(v) => (v.length > 12 ? v.slice(0, 12) + "…" : v)}
                          />
                          <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} width={30} />
                          <Tooltip content={<ChartTooltip />} />
                          <Bar dataKey="rating" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <EmptyText />
                  )}
                </Section>

                <Section title="Most purchased">
                  {recs.mostPurchased?.length ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={recs.mostPurchased.map((b) => ({
                            name: b.title,
                            purchases: b.purchaseCount,
                          }))}
                          layout="vertical"
                          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                        >
                          <XAxis type="number" tick={{ fontSize: 11 }} />
                          <YAxis
                            type="category"
                            dataKey="name"
                            tick={{ fontSize: 11 }}
                            width={120}
                            tickFormatter={(v) => (v.length > 18 ? v.slice(0, 18) + "…" : v)}
                          />
                          <Tooltip content={<ChartTooltip />} />
                          <Bar dataKey="purchases" fill="#6366f1" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <EmptyText />
                  )}
                </Section>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
