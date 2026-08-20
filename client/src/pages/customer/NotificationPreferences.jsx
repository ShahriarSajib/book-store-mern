/**
 * pages/customer/NotificationPreferences.jsx — manage notification settings.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import notificationApi from "../../services/notificationApi";
import Spinner from "../../components/ui/Spinner";

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-lg px-4 py-3 transition-colors hover:bg-slate-50">
      <span className="text-sm text-slate-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
          checked ? "bg-indigo-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
}

export default function NotificationPreferences() {
  const queryClient = useQueryClient();

  const prefsQuery = useQuery({
    queryKey: ["notifications", "preferences"],
    queryFn: notificationApi.getPreferences,
  });

  const updateMutation = useMutation({
    mutationFn: (preferences) => notificationApi.updatePreferences(preferences),
    onSuccess: () => {
      toast.success("Preferences saved");
      queryClient.invalidateQueries({ queryKey: ["notifications", "preferences"] });
    },
    onError: (err) => toast.error(err?.response?.data?.error?.message || "Could not save preferences"),
  });

  if (prefsQuery.isLoading) {
    return (
      <div className="flex justify-center py-16 text-indigo-600">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const prefs = prefsQuery.data || {
    email: { orderUpdates: true, promotions: true, newsletter: true },
    push: { orderUpdates: true, promotions: false, newsletter: false },
  };

  const update = (channel, key, value) => {
    const updated = {
      ...prefs,
      [channel]: { ...prefs[channel], [key]: value },
    };
    updateMutation.mutate(updated);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Notification preferences</h1>
        <p className="text-sm text-slate-500">Choose which notifications you receive and how.</p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-3">
          <h2 className="text-sm font-semibold text-slate-800">Email notifications</h2>
        </div>
        <div className="divide-y divide-slate-100">
          <Toggle
            label="Order updates"
            checked={prefs.email?.orderUpdates !== false}
            onChange={(v) => update("email", "orderUpdates", v)}
          />
          <Toggle
            label="Promotions and deals"
            checked={prefs.email?.promotions !== false}
            onChange={(v) => update("email", "promotions", v)}
          />
          <Toggle
            label="Newsletter"
            checked={prefs.email?.newsletter !== false}
            onChange={(v) => update("email", "newsletter", v)}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-3">
          <h2 className="text-sm font-semibold text-slate-800">In-app notifications</h2>
        </div>
        <div className="divide-y divide-slate-100">
          <Toggle
            label="Order updates"
            checked={prefs.push?.orderUpdates !== false}
            onChange={(v) => update("push", "orderUpdates", v)}
          />
          <Toggle
            label="Promotions and deals"
            checked={prefs.push?.promotions === true}
            onChange={(v) => update("push", "promotions", v)}
          />
          <Toggle
            label="Newsletter"
            checked={prefs.push?.newsletter === true}
            onChange={(v) => update("push", "newsletter", v)}
          />
        </div>
      </section>
    </div>
  );
}
