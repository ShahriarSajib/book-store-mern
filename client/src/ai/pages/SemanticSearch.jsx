import { useState } from "react";

import {
  semanticSearch,
} from "../api/semanticSearchApi";

import SemanticSearchResults from "../components/SemanticSearchResults";

import SemanticSearchFilter from "../components/SemanticSearchFilter";

const SemanticSearch = () => {
  const [query, setQuery] = useState("");

  const [results, setResults] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
  });

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!query.trim()) {
      setError("Please enter a search query.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await semanticSearch({
        query,
        limit: 10,
        category: filters.category,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
      });

      setResults(data.results);
    } catch (err) {
      setError(
        err.message || "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="semantic-search-page">

      <h1>AI Book Search</h1>

      <p>
        Search for books using natural language.
      </p>

      <form onSubmit={handleSearch}>

        <input
          type="text"
          value={query}
          onChange={(e) =>
            setQuery(e.target.value)
          }
          placeholder="e.g. books for learning Python"
        />

        <button
          type="submit"
          disabled={loading}
        >
          {loading ? "Searching..." : "AI Search"}
        </button>

      </form>

      <SemanticSearchFilter
        filters={filters}
        setFilters={setFilters}
      />

      {query && (
        <p>
          Results for: <strong>{query}</strong>
        </p>
      )}

      <SemanticSearchResults
        results={results}
        loading={loading}
        error={error}
      />

    </div>
  );
};

export default SemanticSearch;