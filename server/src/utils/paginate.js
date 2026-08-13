/**
 * utils/paginate.js — pagination helper for list endpoints.
 * Returns { page, limit, skip, total, pages, hasNext, hasPrev }.
 */
function getPagination(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
}

function buildPageMeta(total, page, limit) {
  const pages = total === 0 ? 0 : Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    pages,
    hasNext: page < pages,
    hasPrev: page > 1,
  };
}

module.exports = { getPagination, buildPageMeta };
