export default function PersonalizedBookCard({
  book,
}) {
  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white">
      {book.coverImage && (
        <img
          src={book.coverImage}
          alt={book.title}
          className="w-full h-56 object-cover rounded"
        />
      )}

      <h3 className="font-semibold mt-3">
        {book.title}
      </h3>

      <p className="text-sm text-gray-600">
        {book.authors?.join(", ")}
      </p>

      <p className="mt-2">
        ⭐ {book.averageRating || 0}
      </p>

      <p className="text-sm text-green-600 mt-2">
        Recommended because:{" "}
        {book.recommendationReason}
      </p>

      <p className="font-bold mt-2">
        ৳{book.price}
      </p>
    </div>
  );
}