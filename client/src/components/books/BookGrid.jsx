/**
 * components/books/BookGrid.jsx — responsive grid of BookCards.
 */
import BookCard from "./BookCard";
import { SkeletonCard } from "../ui/Skeleton";
import EmptyState from "../ui/EmptyState";
import { FaBookOpen } from "react-icons/fa";

export default function BookGrid({ books = [], loading = false, emptyTitle = "No books found", emptyDescription }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 min-[400px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return <EmptyState icon={FaBookOpen} title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 min-[400px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {books.map((book) => (
        <BookCard key={book.id || book._id} book={book} />
      ))}
    </div>
  );
}
