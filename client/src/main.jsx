import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import baseURL from "./config/api";
import "./styles/index.css";

// Warm the connection to the API host. The client and the API are served from
// different origins in production, so this saves a TCP+TLS round trip on the
// first API call. The host is environment-specific, so it has to be resolved
// at runtime — a static <link> in index.html would point at the wrong host.
const API_ORIGIN = baseURL.replace(/\/api\/?$/, "");
if (API_ORIGIN && API_ORIGIN !== window.location.origin) {
  const preconnect = document.createElement("link");
  preconnect.rel = "preconnect";
  preconnect.href = API_ORIGIN;
  preconnect.crossOrigin = "anonymous";
  document.head.appendChild(preconnect);
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <SocketProvider>
              <CartProvider>
                <App />
                <Toaster position="top-right" />
              </CartProvider>
            </SocketProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
