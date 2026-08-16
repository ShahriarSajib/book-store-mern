const SemanticBookCard = ({ book }) => {
  return (
    <div className="semantic-book-card">
      {book.coverImage && (
        <img
          src={book.coverImage}
          alt={book.title}
        />
      )}

      <div>
        <h3>{book.title}</h3>

        {book.authors?.length > 0 && (
          <p>
            By {book.authors.join(", ")}
          </p>
        )}

        <p>
          {book.description?.slice(0, 150)}
          {book.description?.length > 150
            ? "..."
            : ""}
        </p>

        <div>
          <strong>
            ${book.price}
          </strong>
        </div>

        <div>
          ⭐ {book.averageRating || 0}
        </div>

        <small>
          Semantic similarity:{" "}
          {(book.similarity * 100).toFixed(1)}%
        </small>
      </div>
    </div>
  );
};

export default SemanticBookCard;