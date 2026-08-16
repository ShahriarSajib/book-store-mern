/**
 * pages/admin/Analytics.jsx — sales, inventory, recommendation analytics.
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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

const labelize = (value) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : value);

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-slate-800">{title}</h3>
      {children}
    </div>
  );
}

function EmptyText({ children = "No data yet." }) {
  return <p className="py-4 text-sm text-slate-400">{children}</p>;
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

  const maxRevenue = Math.max(0, ...(sales?.series || []).map((s) => s.revenue || 0));

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
                <Section title="Sales over time">
                  {sales.series?.length ? (
                    <div className="space-y-3">
                      {sales.series.map((s) => (
                        <div key={s._id}>
                          <div className="mb-1 flex justify-between text-xs text-slate-500">
                            <span>{labelize(String(s._id))}</span>
                            <span>{formatCurrency(s.revenue)}</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-100">
                            <div
                              className="h-2 rounded-full bg-indigo-500"
                              style={{
                                width: `${maxRevenue ? (s.revenue / maxRevenue) * 100 : 0}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
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
                  <div className="flex flex-wrap gap-2">
                    {sales.statusBreakdown.map((s) => (
                      <span
                        key={s._id}
                        className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
                      >
                        {labelize(s._id)} · {formatNumber(s.count)}
                      </span>
                    ))}
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

              <Section title="Low stock">
                {inventory.lowStock?.length ? (
                  <div className="space-y-2">
                    {inventory.lowStock.map((b) => (
                      <div
                        key={b._id || b.id}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <p className="truncate text-slate-700">{b.title}</p>
                        <p className="shrink-0 text-xs font-medium text-amber-600">
                          {b.stock} left
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyText>All books are well stocked.</EmptyText>
                )}
              </Section>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
                <strong>{formatNumber(inventory.outOfStock)}</strong> books out of stock.
              </div>
            </>
          )}
        </div>
      )}

      {tab === "recommendations" && (
        <div className="space-y-6">
          {recsQuery.isLoading ? (
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
                <Section title="Top rated">
                  {recs.topRated?.length ? (
                    <div className="space-y-2">
                      {recs.topRated.map((b) => (
                        <div
                          key={b._id || b.id}
                          className="flex items-center justify-between gap-3 text-sm"
                        >
                          <p className="truncate text-slate-700">{b.title}</p>
                          <p className="shrink-0 text-xs text-slate-500">
                            {(b.averageRating ?? 0).toFixed(1)} ★ ({formatNumber(b.ratingsCount)})
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyText />
                  )}
                </Section>

                <Section title="Most purchased">
                  {recs.mostPurchased?.length ? (
                    <div className="space-y-2">
                      {recs.mostPurchased.map((b) => (
                        <div
                          key={b._id || b.id}
                          className="flex items-center justify-between gap-3 text-sm"
                        >
                          <p className="truncate text-slate-700">{b.title}</p>
                          <p className="shrink-0 text-xs text-slate-500">
                            {formatNumber(b.purchaseCount)} purchases
                          </p>
                        </div>
                      ))}
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
