/**
 * pages/admin/Users.jsx — admin user management (RBAC).
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import adminApi from "../../services/adminApi";
import useAuth from "../../hooks/useAuth";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import { FaSearch, FaTrash } from "react-icons/fa";

const ROLES = ["customer", "book_manager", "order_manager", "admin"];

function StatusBadge({ active, verified }) {
  return (
    <span className="space-x-1">
      <span className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
        {active ? "Active" : "Disabled"}
      </span>
      {!verified && (
        <span className="inline-block rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700">Unverified</span>
      )}
    </span>
  );
}

export default function Users() {
  const { user: me } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["admin", "users", { search, role, status, page }],
    queryFn: () => adminApi.users.list({ search, role, status, page, limit: 10 }),
    keepPreviousData: true,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }) => adminApi.users.update(id, patch),
    onSuccess: () => {
      toast.success("User updated");
      invalidate();
    },
    onError: (err) => toast.error(err?.response?.data?.error?.message || "Update failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.users.remove(id),
    onSuccess: () => {
      toast.success("User deleted");
      invalidate();
    },
    onError: (err) => toast.error(err?.response?.data?.error?.message || "Delete failed"),
  });

  const handleDelete = (user) => {
    if (user.id === me.id) {
      toast.error("You cannot delete your own account");
      return;
    }
    if (window.confirm(`Delete ${user.name} (${user.email})? This cannot be undone.`)) {
      deleteMutation.mutate(user.id);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setRole("");
    setStatus("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">User management</h1>
        <p className="text-sm text-slate-500">View users, assign roles, enable/disable accounts.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
          }}
        >
          <div className="relative">
            <FaSearch className="pointer-events-none absolute left-3 top-2.5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or email…"
              className="w-64 rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </div>
        </form>

        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none"
        >
          <option value="">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
        </select>

        {(search || role || status) && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Clear filters
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16 text-brand-600">
          <Spinner className="h-8 w-8" />
        </div>
      ) : data.users.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          No users match your filters.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((u) => (
                <tr key={u.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                        {u.name.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <p className="font-medium text-slate-800">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      disabled={u.id === me.id}
                      onChange={(e) => updateMutation.mutate({ id: u.id, patch: { role: e.target.value } })}
                      className="rounded-md border border-slate-300 px-2 py-1 text-sm capitalize focus:border-brand-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge active={u.isActive} verified={u.isEmailVerified} />
                  </td>
                  <td className="px-4 py-3 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {u.id !== me.id && (
                        <Button
                          variant={u.isActive ? "secondary" : "primary"}
                          size="sm"
                          loading={updateMutation.isLoading && updateMutation.variables?.id === u.id}
                          onClick={() =>
                            updateMutation.mutate({ id: u.id, patch: { isActive: !u.isActive } })
                          }
                        >
                          {u.isActive ? "Disable" : "Enable"}
                        </Button>
                      )}
                      <Button
                        variant="danger"
                        size="sm"
                        loading={deleteMutation.isLoading && deleteMutation.variables === u.id}
                        onClick={() => handleDelete(u)}
                        aria-label={`Delete ${u.name}`}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {data.pagination && data.pagination.pages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm">
              <span className="text-slate-500">
                Page {data.pagination.page} of {data.pagination.pages} ({data.pagination.total} users)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!data.pagination.hasPrev}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!data.pagination.hasNext}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      {isFetching && !isLoading && <p className="text-xs text-slate-400">Updating…</p>}
    </div>
  );
}
