/**
 * pages/admin/Analytics.jsx — sales, inventory, recommendation analytics with charts.
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import adminApi from "../../services/adminApi";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import { formatCurrency, formatNumber } from "../../utils/format";

const DAYS_OPTIONS = [7, 30, 90];

const TABS = [
  { key: "sales", label: "Sales" },
  { key: "inventory", label: "Inventory" },
  { key: "recommendations", label: "Recommendations" },
];

const PIE_COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#818cf8", "#6d28d9"];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md dark:border-slate-700 dark:bg-slate-800">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === "number" ? formatNumber(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
};

const CustomPieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md dark:border-slate-700 dark:bg-slate-800">
      <p className="text-xs font-medium text-slate-500">{entry.name}</p>
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
        {formatNumber(entry.value)} orders
      </p>
    </div>
  );
};

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

function ChartCard({ title, children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 ${className}`}>
      <h3 className="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
      {children}
    </div>
  );
}

function EmptyText({ children = "No data yet." }) {
  return <p className="py-4 text-sm text-slate-400">{children}</p>;
}

const renderPieLabel = ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`;

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

  const salesLoading = salesQuery.isLoading;
  const inventoryLoading = inventoryQuery.isLoading;
  const recsLoading = recsQuery.isLoading;

  const statusData = (sales?.statusBreakdown || []).map((s) => ({
    name: s._id.charAt(0).toUpperCase() + s._id.slice(1),
    value: s.count,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Sales, inventory and recommendation insights.</p>
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

      {/* ── Sales Tab ─────────────────────────────────── */}
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

          {salesLoading ? (
            <div className="flex justify-center py-16 text-indigo-600">
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
                <ChartCard title="Revenue over time">
                  {sales.series?.length ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={sales.series} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis
                          dataKey="_id"
                          tick={{ fontSize: 12, fill: "#94a3b8" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 12, fill: "#94a3b8" }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v) => `$${v}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="revenue" name="Revenue" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyText>No sales data for this range.</EmptyText>
                  )}
                </ChartCard>

                <ChartCard title="Top books">
                  {sales.topBooks?.length ? (
                    <div className="space-y-2">
                      {sales.topBooks.map((b, i) => (
                        <div
                          key={b._id || b.id}
                          className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                            {i + 1}
                          </span>
                          <p className="min-w-0 truncate text-sm text-slate-700 dark:text-slate-300">{b.title}</p>
                          <p className="ml-auto shrink-0 text-xs text-slate-500 dark:text-slate-400">
                            {formatNumber(b.qty)} sold · {formatCurrency(b.revenue)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyText />
                  )}
                </ChartCard>
              </div>

              <ChartCard title="Orders by status">
                {statusData.length ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={110}
                        paddingAngle={3}
                        dataKey="value"
                        label={renderPieLabel}
                      >
                        {statusData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        formatter={(value) => <span className="text-xs text-slate-600 dark:text-slate-300">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyText />
                )}
              </ChartCard>
            </div>
          )}
        </div>
      )}

      {/* ── Inventory Tab ─────────────────────────────── */}
      {tab === "inventory" && (
        <div className="space-y-6">
          {inventoryLoading ? (
            <div className="flex justify-center py-16 text-indigo-600">
              <Spinner className="h-8 w-8" />
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label="Total books" value={formatNumber(inventory.totals?.books)} />
                <StatCard label="Total stock" value={formatNumber(inventory.totals?.totalStock)} />
                <StatCard label="Inventory value" value={formatCurrency(inventory.totals?.value)} />
              </div>

              <ChartCard title="Low stock — units remaining">
                {inventory.lowStock?.length ? (
                  <ResponsiveContainer width="100%" height={Math.max(200, inventory.lowStock.length * 48)}>
                    <BarChart
                      data={inventory.lowStock}
                      layout="vertical"
                      margin={{ top: 5, right: 30, bottom: 5, left: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 12, fill: "#94a3b8" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="title"
                        width={160}
                        tick={{ fontSize: 12, fill: "#64748b" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="stock" name="Stock" fill="#f59e0b" radius={[0, 6, 6, 0]} maxBarSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyText>All books are well stocked.</EmptyText>
                )}
              </ChartCard>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                <strong>{formatNumber(inventory.outOfStock)}</strong> books out of stock.
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Recommendations Tab ───────────────────────── */}
      {tab === "recommendations" && (
        <div className="space-y-6">
          {recsLoading ? (
            <div className="flex justify-center py-16 text-indigo-600">
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
                <ChartCard title="Top rated books">
                  {recs.topRated?.length ? (
                    <ResponsiveContainer width="100%" height={Math.max(200, recs.topRated.length * 48)}>
                      <BarChart
                        data={recs.topRated}
                        layout="vertical"
                        margin={{ top: 5, right: 30, bottom: 5, left: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                        <XAxis
                          type="number"
                          domain={[0, 5]}
                          tick={{ fontSize: 12, fill: "#94a3b8" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          type="category"
                          dataKey="title"
                          width={140}
                          tick={{ fontSize: 12, fill: "#64748b" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="averageRating" name="Rating" fill="#6366f1" radius={[0, 6, 6, 0]} maxBarSize={28} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyText />
                  )}
                </ChartCard>

                <ChartCard title="Most purchased books">
                  {recs.mostPurchased?.length ? (
                    <ResponsiveContainer width="100%" height={Math.max(200, recs.mostPurchased.length * 48)}>
                      <BarChart
                        data={recs.mostPurchased}
                        layout="vertical"
                        margin={{ top: 5, right: 30, bottom: 5, left: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                        <XAxis
                          type="number"
                          tick={{ fontSize: 12, fill: "#94a3b8" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          type="category"
                          dataKey="title"
                          width={140}
                          tick={{ fontSize: 12, fill: "#64748b" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="purchaseCount" name="Purchases" fill="#8b5cf6" radius={[0, 6, 6, 0]} maxBarSize={28} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyText />
                  )}
                </ChartCard>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
