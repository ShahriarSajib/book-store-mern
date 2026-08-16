export default function SimilarBookCard({
  book,
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition">
      {book.coverImage && (
        <img
          src={book.coverImage}
          alt={book.title}
          className="w-full h-64 object-cover rounded-lg mb-4"
        />
      )}

      <h3 className="font-semibold text-lg line-clamp-2">
        {book.title}
      </h3>

      {book.authors?.length > 0 && (
        <p className="text-sm text-gray-500 mt-1">
          {book.authors.join(", ")}
        </p>
      )}

      <div className="flex items-center justify-between mt-3">
        <span className="font-semibold">
          ${book.price}
        </span>

        <span className="text-sm">
          ⭐ {book.averageRating || 0}
        </span>
      </div>

      <div className="mt-3">
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
          {Math.round(
            (book.similarity || 0) * 100
          )}
          % similar
        </span>
      </div>
    </div>
  );
}