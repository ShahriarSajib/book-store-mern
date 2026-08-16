/**
 * hooks/usePagination.js — page navigation helper for paginated lists.
 */
import { useState } from "react";

export default function usePagination({ initialPage = 1 } = {}) {
  const [page, setPage] = useState(initialPage);

  const go = (next) => {
    setPage(Math.max(1, next));
  };

  const next = () => go(page + 1);
  const prev = () => go(page - 1);

  return { page, setPage: go, go, next, prev };
}
