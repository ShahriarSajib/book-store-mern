import { useEffect, useState } from "react";

import {
  getPersonalizedRecommendations,
} from "../api/recommendationApi";

import PersonalizedBookCard from "../components/PersonalizedBookCard";

export default function RecommendedForYou() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRecommendations() {
      try {
        const token =
          localStorage.getItem("accessToken");

        if (!token) {
          setError(
            "Please login to see personalized recommendations."
          );
          return;
        }

        const data =
          await getPersonalizedRecommendations(
            token
          );

        setBooks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        Loading recommendations...
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
        Recommended For You
      </h2>

      {books.length === 0 ? (
        <p>No recommendations available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {books.map((book) => (
            <PersonalizedBookCard
              key={book._id}
              book={book}
            />
          ))}
        </div>
      )}
    </section>
  );
}