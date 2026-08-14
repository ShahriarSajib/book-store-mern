/**
 * components/ui/Input.jsx
 */
import { forwardRef } from "react";
import cn from "../../utils/cn";

const Input = forwardRef(function Input(
  { label, error, className, type = "text", textarea = false, rows = 4, ...props },
  ref
) {
  const classes = cn(
    "w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2",
    error
      ? "border-red-400 focus:ring-red-200"
      : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-200",
    className
  );

  return (
    <label className="block">
      {label && <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>}
      {textarea ? (
        <textarea ref={ref} rows={rows} className={classes} {...props} />
      ) : (
        <input
          ref={ref}
          type={type}
          className={classes}
          {...props}
        />
      )}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
});

export default Input;
