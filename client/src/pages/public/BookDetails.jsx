/**
 * pages/public/BookDetails.jsx — full book detail view.
 */
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FaArrowLeft, FaShoppingCart, FaBookOpen, FaCalendarAlt, FaFileAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import bookApi from "../../services/bookApi";
import { formatCurrency } from "../../utils/format";
import Button from "../../components/ui/Button";
import Rating from "../../components/ui/Rating";
import Spinner from "../../components/ui/Spinner";
import { useCartContext } from "../../context/CartContext";

export default function BookDetails() {
  const { id } = useParams();
  const { addItem } = useCartContext();
  const [qty, setQty] = useState(1);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["book", id],
    queryFn: () => bookApi.get(id),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-24 text-brand-600">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-10 text-center">
        <p className="font-medium text-red-700">Failed to load this book</p>
        <p className="text-sm text-red-600">{error?.response?.data?.error?.message || error.message}</p>
      </div>
    );
  }

  const book = data.book;
  const inStock = (book.stock ?? 0) > 0;

  const handleAdd = () => {
    addItem({ book: { id: book.id || book._id, title: book.title, price: book.price, coverImage: book.coverImage }, quantity: qty });
    toast.success(`${book.title} added to cart`);
  };

  return (
    <div className="mx-auto max-w-6xl">
      <Link to="/books" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:underline">
        <FaArrowLeft /> Back to catalog
      </Link>

      <div className="grid gap-8 md:grid-cols-[320px_1fr]">
        <div>
          <div className="flex aspect-[2/3] items-center justify-center overflow-hidden rounded-2xl border border-ink-100 bg-ink-50 shadow-soft">
            {book.coverImage ? (
              <img
                src={book.coverImage}
                alt={book.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <FaBookOpen className="h-16 w-16 text-ink-300" />
            )}
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-ink-900">{book.title}</h1>
          {book.subtitle && <p className="mt-1 text-lg text-ink-500">{book.subtitle}</p>}
          <p className="mt-2 text-sm text-ink-600">by {book.authors?.join(", ") || "Unknown author"}</p>

          <div className="mt-3">
            <Rating value={book.averageRating} count={book.ratingsCount} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {book.categories?.map((cat) => (
              <Link key={cat} to={`/books?category=${encodeURIComponent(cat)}`} className="chip hover:border-brand-400">
                {cat}
              </Link>
            ))}
          </div>

          {book.description && (
            <p className="mt-6 text-sm leading-relaxed text-ink-700">{book.description}</p>
          )}

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-600">
            {book.publishedYear && (
              <span className="inline-flex items-center gap-1.5">
                <FaCalendarAlt className="text-ink-400" /> Published {book.publishedYear}
              </span>
            )}
            {book.pages && (
              <span className="inline-flex items-center gap-1.5">
                <FaFileAlt className="text-ink-400" /> {book.pages} pages
              </span>
            )}
            {book.publisher && <span>Publisher: {book.publisher}</span>}
            {book.language && <span>Language: {book.language}</span>}
          </div>

          <div className="mt-8 rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm text-ink-500">Price</p>
                <p className="text-3xl font-bold text-ink-900">{formatCurrency(book.price)}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {inStock ? `${book.stock} in stock` : "Out of stock"}
              </span>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <input
                type="number"
                min="1"
                max={book.stock}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Math.min(book.stock, Number(e.target.value))))}
                disabled={!inStock}
                className="w-20 rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:bg-ink-50"
                aria-label="Quantity"
              />
              <Button
                size="lg"
                fullWidth
                disabled={!inStock}
                onClick={handleAdd}
                className="!py-3"
              >
                <FaShoppingCart /> {inStock ? "Add to cart" : "Out of stock"}
              </Button>
            </div>
          </div>

          {book.isbn13 && (
            <p className="mt-4 text-xs text-ink-400">ISBN-13: {book.isbn13}{book.isbn10 ? ` · ISBN-10: ${book.isbn10}` : ""}</p>
          )}
        </div>
      </div>
    </div>
  );
}
