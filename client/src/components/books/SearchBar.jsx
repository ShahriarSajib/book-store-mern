/**
 * components/books/SearchBar.jsx — debounced keyword search input.
 */
import { useState, useEffect, useRef } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import useDebounce from "../../hooks/useDebounce";

export default function SearchBar({ value: initialValue = "", onChange, placeholder = "Search by title, author or description…", autoFocus = false }) {
  const [value, setValue] = useState(initialValue);
  const debounced = useDebounce(value, 400);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    onChangeRef.current(debounced);
  }, [debounced]);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <form
      className="relative"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onChange(value);
      }}
    >
      <FaSearch className="pointer-events-none absolute left-4 top-3 text-ink-400" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full rounded-xl border border-ink-200 bg-white py-3 pl-11 pr-10 text-sm text-ink-900 placeholder-ink-400 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          aria-label="Clear search"
          className="absolute right-3 top-2.5 rounded-full p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-600"
        >
          <FaTimes className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}
