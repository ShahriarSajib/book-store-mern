import { useEffect, useState } from "react";
import { getSimilarBooks } from "../api/similarBookApi";
import SimilarBookCard from "../components/SimilarBookCard";

export default function SimilarBooks({
  bookId,
}) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bookId) return;

    async function loadSimilarBooks() {
      try {
        setLoading(true);
        setError("");

        const data = await getSimilarBooks(
          bookId,
          {
            limit: 8,
          }
        );

        setBooks(data.results || []);
      } catch (err) {
        setError(
          err.message ||
            "Failed to load similar books."
        );
      } finally {
        setLoading(false);
      }
    }

    loadSimilarBooks();
  }, [bookId]);

  if (loading) {
    return (
      <section className="mt-10">
        <h2 className="text-2xl font-bold mb-5">
          Similar Books
        </h2>

        <p>Finding similar books...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mt-10">
        <h2 className="text-2xl font-bold mb-5">
          Similar Books
        </h2>

        <p className="text-red-500">
          {error}
        </p>
      </section>
    );
  }

  if (books.length === 0) {
    return null;
  }

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-bold mb-5">
        Similar Books
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {books.map((book) => (
          <SimilarBookCard
            key={book._id}
            book={book}
          />
        ))}
      </div>
    </section>
  );
}