const SemanticSearchFilter = ({
  filters,
  setFilters,
}) => {
  return (
    <div className="semantic-search-filter">
      <input
        type="number"
        placeholder="Min price"
        value={filters.minPrice}
        onChange={(e) =>
          setFilters({
            ...filters,
            minPrice: e.target.value,
          })
        }
      />

      <input
        type="number"
        placeholder="Max price"
        value={filters.maxPrice}
        onChange={(e) =>
          setFilters({
            ...filters,
            maxPrice: e.target.value,
          })
        }
      />

      <input
        type="text"
        placeholder="Category"
        value={filters.category}
        onChange={(e) =>
          setFilters({
            ...filters,
            category: e.target.value,
          })
        }
      />
    </div>
  );
};

export default SemanticSearchFilter;