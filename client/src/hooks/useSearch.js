/**
 * hooks/useSearch.js — keyword + semantic search with filters/sort/page.
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "./useDebounce";
import bookApi from "../services/bookApi";

export default function useSearch({
  initialQuery = "",
  initialCategory = "",
  initialAuthor = "",
  initialSort = "relevance",
  pageSize = 12,
  enabled = true,
} = {}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [author, setAuthor] = useState(initialAuthor);
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(1);
  const [inStock, setInStock] = useState(false);

  const debouncedQuery = useDebounce(query, 400);

  const params = {};
  if (debouncedQuery) params.q = debouncedQuery;
  if (category) params.category = category;
  if (author) params.author = author;
  if (sort && sort !== "relevance") params.sort = sort;
  if (inStock) params.inStock = "true";
  params.page = page;
  params.limit = pageSize;

  const result = useQuery({
    queryKey: ["books-search", params],
    queryFn: () => bookApi.list(params),
    enabled,
  });

  return {
    ...result,
    query,
    setQuery: (value) => {
      setQuery(value);
      setPage(1);
    },
    category,
    setCategory: (value) => {
      setCategory(value);
      setPage(1);
    },
    author,
    setAuthor: (value) => {
      setAuthor(value);
      setPage(1);
    },
    sort,
    setSort: (value) => {
      setSort(value);
      setPage(1);
    },
    inStock,
    setInStock: (value) => {
      setInStock(value);
      setPage(1);
    },
    page,
    setPage,
    params,
  };
}
