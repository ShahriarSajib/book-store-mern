/**
 * pages/admin/Inventory.jsx — stock + low-stock alerts.
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import adminApi from "../../services/adminApi";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import { formatCurrency } from "../../utils/format";

const LOW_STOCK = 10;

const getId = (item) => item?._id || item?.id;

function StockBadge({ stock }) {
  const cls =
    stock <= 0
      ? "bg-red-100 text-red-700"
      : stock <= LOW_STOCK
        ? "bg-amber-100 text-amber-700"
        : "bg-green-100 text-green-700";
  const label = stock <= 0 ? "Out" : stock <= LOW_STOCK ? "Low" : "In stock";
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

export default function Inventory() {
  const queryClient = useQueryClient();
  const [lowOnly, setLowOnly] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [stockValue, setStockValue] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "inventory"],
    queryFn: () => adminApi.inventory.list(),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "inventory"] });

  const updateMutation = useMutation({
    mutationFn: ({ id, stock }) => adminApi.inventory.updateStock(id, stock),
    onSuccess: () => {
      toast.success("Stock updated");
      setEditingId(null);
      setStockValue("");
      invalidate();
    },
    onError: (err) =>
      toast.error(err?.response?.data?.error?.message || err?.message || "Update failed"),
  });

  const items = data?.items || [];
  const shown = lowOnly ? items.filter((b) => b.stock <= LOW_STOCK) : items;

  const handleSave = (book) => {
    const stock = Number(stockValue);
    if (!Number.isFinite(stock) || stock < 0) {
      toast.error("Enter a valid stock number");
      return;
    }
    updateMutation.mutate({ id: getId(book), stock });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
          <p className="text-sm text-slate-500">Monitor and update stock levels.</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={lowOnly}
            onChange={(e) => setLowOnly(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          Show low stock only
        </label>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16 text-brand-600">
          <Spinner className="h-8 w-8" />
        </div>
      ) : shown.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          {lowOnly ? "No low stock books." : "No inventory yet."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">Book</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((book) => (
                <tr key={getId(book)} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-9 shrink-0 items-center justify-center overflow-hidden rounded bg-slate-50">
                        {book.coverImage ? (
                          <img src={book.coverImage} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </div>
                      <p className="max-w-[260px] truncate font-medium text-slate-800">
                        {book.title}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {formatCurrency(book.price)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={editingId === getId(book) ? stockValue : book.stock ?? 0}
                        onChange={(e) => {
                          setEditingId(getId(book));
                          setStockValue(e.target.value);
                        }}
                        onFocus={() => {
                          setEditingId(getId(book));
                          setStockValue(String(book.stock ?? 0));
                        }}
                        className="w-24 rounded-md border border-slate-300 px-2 py-1 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={editingId !== getId(book)}
                        loading={
                          updateMutation.isLoading &&
                          updateMutation.variables?.id === getId(book)
                        }
                        onClick={() => handleSave(book)}
                      >
                        Save
                      </Button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StockBadge stock={book.stock ?? 0} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
