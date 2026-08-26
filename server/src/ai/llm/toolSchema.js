/**
 * ai/llm/toolSchema.js
 * OpenAI function-calling tool definitions.
 * Two sets: read tools and write tools (kept separate for guardrails).
 */

const searchBooks = {
  type: "function",
  function: {
    name: "searchBooks",
    description: "Search for books by keyword, category, author, or topic. Returns a list of matching books.",
    parameters: {
      type: "object",
      properties: {
        q: { type: "string", description: "Search query (title, author, keyword)" },
        category: { type: "string", description: "Filter by category name" },
        author: { type: "string", description: "Filter by author name" },
        minPrice: { type: "number", description: "Minimum price" },
        maxPrice: { type: "number", description: "Maximum price" },
        sort: { type: "string", enum: ["rating", "price_asc", "price_desc", "newest"], description: "Sort order" },
        limit: { type: "number", description: "Max results (default 5)" },
      },
    },
  },
};

const semanticSearchBooks = {
  type: "function",
  function: {
    name: "semanticSearchBooks",
    description: "Search books using semantic similarity (meaning-based). Good for natural language queries like 'books about space exploration' or 'heartwarming stories about friendship'.",
    parameters: {
      type: "object",
      properties: {
        q: { type: "string", description: "Natural language search query" },
        limit: { type: "number", description: "Max results (default 5)" },
      },
      required: ["q"],
    },
  },
};

const getBookDetails = {
  type: "function",
  function: {
    name: "getBookDetails",
    description: "Get detailed information about a specific book.",
    parameters: {
      type: "object",
      properties: {
        bookId: { type: "string", description: "The book's unique ID" },
      },
      required: ["bookId"],
    },
  },
};

const compareBooks = {
  type: "function",
  function: {
    name: "compareBooks",
    description: "Compare two books side by side (price, rating, availability).",
    parameters: {
      type: "object",
      properties: {
        bookIds: { type: "array", items: { type: "string" }, description: "Array of two book IDs to compare", minItems: 2, maxItems: 2 },
      },
      required: ["bookIds"],
    },
  },
};

const getSimilarBooks = {
  type: "function",
  function: {
    name: "getSimilarBooks",
    description: "Find books similar to a given book based on content similarity.",
    parameters: {
      type: "object",
      properties: {
        bookId: { type: "string", description: "Source book ID" },
        k: { type: "number", description: "Number of similar books (default 5)" },
      },
      required: ["bookId"],
    },
  },
};

const getPersonalizedRecommendations = {
  type: "function",
  function: {
    name: "getPersonalizedRecommendations",
    description: "Get personalized book recommendations based on the user's reading history and preferences.",
    parameters: {
      type: "object",
      properties: {
        k: { type: "number", description: "Number of recommendations (default 5)" },
      },
    },
  },
};

const getTrendingBooks = {
  type: "function",
  function: {
    name: "getTrendingBooks",
    description: "Get currently trending/popular books.",
    parameters: {
      type: "object",
      properties: {
        k: { type: "number", description: "Number of trending books (default 5)" },
      },
    },
  },
};

const getCart = {
  type: "function",
  function: {
    name: "getCart",
    description: "View the user's current shopping cart contents.",
    parameters: { type: "object", properties: {} },
  },
};

const getOrderHistory = {
  type: "function",
  function: {
    name: "getOrderHistory",
    description: "Get the user's recent order history.",
    parameters: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Number of orders to show (default 5)" },
      },
    },
  },
};

const getOrderStatus = {
  type: "function",
  function: {
    name: "getOrderStatus",
    description: "Get the status and details of a specific order, or the most recent order if no ID is given.",
    parameters: {
      type: "object",
      properties: {
        orderId: { type: "string", description: "Order ID (optional, defaults to latest)" },
      },
    },
  },
};

const searchFAQ = {
  type: "function",
  function: {
    name: "searchFAQ",
    description: "Search the FAQ/knowledge base for answers about shipping, returns, payments, account issues, and store policies.",
    parameters: {
      type: "object",
      properties: {
        q: { type: "string", description: "Question to search for" },
      },
      required: ["q"],
    },
  },
};

const getWishlist = {
  type: "function",
  function: {
    name: "getWishlist",
    description: "View the user's wishlist.",
    parameters: { type: "object", properties: {} },
  },
};

// --- Write tools ---

const addToCart = {
  type: "function",
  function: {
    name: "addToCart",
    description: "Add a book to the user's shopping cart.",
    parameters: {
      type: "object",
      properties: {
        bookId: { type: "string", description: "Book ID to add" },
        quantity: { type: "number", description: "Quantity (default 1)" },
      },
      required: ["bookId"],
    },
  },
};

const removeFromCart = {
  type: "function",
  function: {
    name: "removeFromCart",
    description: "Remove a book from the user's shopping cart.",
    parameters: {
      type: "object",
      properties: {
        bookId: { type: "string", description: "Book ID to remove" },
      },
      required: ["bookId"],
    },
  },
};

const updateCart = {
  type: "function",
  function: {
    name: "updateCart",
    description: "Update the quantity of a book in the cart.",
    parameters: {
      type: "object",
      properties: {
        bookId: { type: "string", description: "Book ID" },
        quantity: { type: "number", description: "New quantity" },
      },
      required: ["bookId", "quantity"],
    },
  },
};

const addToWishlist = {
  type: "function",
  function: {
    name: "addToWishlist",
    description: "Add a book to the user's wishlist.",
    parameters: {
      type: "object",
      properties: {
        bookId: { type: "string", description: "Book ID to add" },
      },
      required: ["bookId"],
    },
  },
};

const removeFromWishlist = {
  type: "function",
  function: {
    name: "removeFromWishlist",
    description: "Remove a book from the user's wishlist.",
    parameters: {
      type: "object",
      properties: {
        bookId: { type: "string", description: "Book ID to remove" },
      },
      required: ["bookId"],
    },
  },
};

const cancelOrder = {
  type: "function",
  function: {
    name: "cancelOrder",
    description: "Cancel a pending or confirmed order. Requires explicit user confirmation.",
    parameters: {
      type: "object",
      properties: {
        orderId: { type: "string", description: "Order ID to cancel" },
      },
      required: ["orderId"],
    },
  },
};

// Collections
const READ_TOOLS = [
  searchBooks, semanticSearchBooks, getBookDetails, compareBooks,
  getSimilarBooks, getPersonalizedRecommendations, getTrendingBooks,
  getCart, getOrderHistory, getOrderStatus, searchFAQ, getWishlist,
];

const WRITE_TOOLS = [
  addToCart, removeFromCart, updateCart,
  addToWishlist, removeFromWishlist, cancelOrder,
];

const ALL_TOOLS = [...READ_TOOLS, ...WRITE_TOOLS];

const WRITE_TOOL_NAMES = new Set(WRITE_TOOLS.map((t) => t.function.name));
const CONFIRM_REQUIRED_TOOLS = new Set(["cancelOrder"]);

export {
  READ_TOOLS,
  WRITE_TOOLS,
  ALL_TOOLS,
  WRITE_TOOL_NAMES,
  CONFIRM_REQUIRED_TOOLS,
};
