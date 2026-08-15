import SemanticBookCard from "./SemanticBookCard";

const SemanticSearchResults = ({
  results,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <div>
        <p>Finding relevant books...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <p>{error}</p>
      </div>
    );
  }

  if (!results.length) {
    return (
      <div>
        <p>No relevant books found.</p>
      </div>
    );
  }

  return (
    <div className="semantic-search-results">
      {results.map((book) => (
        <SemanticBookCard
          key={book._id}
          book={book}
        />
      ))}
    </div>
  );
};

export default SemanticSearchResults;