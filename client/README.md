# Client (React + Vite)

```
src/
├── assets/         static images / icons
├── components/     reusable presentational + composite components
│   ├── layout/     Navbar, Footer, Sidebar, AdminLayout
│   ├── ui/         Button, Input, Spinner, Modal, EmptyState, Pagination, Skeleton, Rating
│   ├── books/      BookCard, BookGrid, BookFilters, BookSort, SearchBar, CategoryList, BookDetail
│   ├── recommendations/  SimilarBooks, PersonalizedForYou, TrendingBooks, RecentlyViewed, SemanticSearchBox
│   ├── chatbot/    ChatbotWidget, ChatWindow, MessageBubble, ChatBookCard, ChatComposer, ConfirmationPrompt, TypingIndicator, ChatHistory
│   ├── cart/       CartItem, CartSummary, CouponInput
│   └── reviews/    ReviewList, ReviewForm, RatingStars
├── pages/          page-level components
│   ├── public/     Home, Books, BookDetails, SearchResults, CategoryPage, AuthorPage, PublisherPage, NotFound
│   ├── auth/       Login, Register, ForgotPassword, ResetPassword, VerifyEmail
│   ├── customer/   Cart, Checkout, Orders, OrderDetails, Wishlist, Profile, Addresses
│   ├── chatbot/    ChatFullPage
│   └── admin/      Dashboard, Users, Books, Categories, Authors, Publishers, Orders, Inventory, Reviews, Coupons, Analytics, AIAssistant
├── features/       feature slices (auth, books, cart, orders, wishlist, reviews, recommendations, chatbot, admin)
├── context/        AuthContext, CartContext, ChatbotContext, ToastContext
├── hooks/          useAuth, useCart, useDebounce, useChatbot, usePagination, useRecommendations, useSearch
├── services/       axios instance + per-domain API modules
├── routes/         ProtectedRoute, AdminRoute, AppRouter
├── styles/         Tailwind entry + utility classes
├── utils/          format, cn (clsx + tailwind-merge), validation (zod)
├── config/         api (base URL), constants (ROLES, ORDER_STATUS)
├── public/         public static files
├── App.jsx         layout shell (Navbar, AppRouter, Footer, floating ChatbotWidget)
└── main.jsx        root render (QueryClientProvider, BrowserRouter, providers)
```

## Run

```
cp .env.example .env
npm install
npm run dev
```
