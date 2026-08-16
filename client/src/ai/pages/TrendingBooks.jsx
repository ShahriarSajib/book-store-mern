import { useEffect, useState } from "react";

import {
  getTrendingBooks,
} from "../api/recommendationApi";

import TrendingBookCard from "../components/TrendingBookCard";

export default function TrendingBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTrending() {
      try {
        const data =
          await getTrendingBooks(10);

        setBooks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadTrending();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        Loading trending books...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <section className="p-6">
      <h2 className="text-2xl font-bold mb-6">
        🔥 Trending Books
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        {books.map((book) => (
          <TrendingBookCard
            key={book._id}
            book={book}
          />
        ))}
      </div>
    </section>
  );
}