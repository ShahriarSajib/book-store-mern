/**
 * App.jsx
 * Responsibility:
 *   - Mount global layout
 *   - Mount route tree
 *   - Mount floating AI chatbot widget (visible on all pages)
 */

import { memo } from "react";
import { useLocation } from "react-router-dom";
import { ChatbotProvider } from "./context/ChatbotContext.jsx";
import AppRouter from "./routes/AppRouter.jsx";
import Navbar from "./components/layout/Navbar.jsx";
import Footer from "./components/layout/Footer.jsx";
import ChatbotWidget from "./components/chatbot/ChatbotWidget.jsx";

const MemoizedNavbar = memo(Navbar);
const MemoizedFooter = memo(Footer);

function ChatbotShell() {
  return (
    <>
      <AppRouter />
      <ChatbotWidget />
    </>
  );
}

export default function App() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <div className="min-h-screen flex flex-col">
      <MemoizedNavbar />
      <main className={`flex-1 ${isAdmin ? "" : "container mx-auto px-4 py-6"}`}>
        <ChatbotProvider>
          <ChatbotShell />
        </ChatbotProvider>
      </main>
      <MemoizedFooter />
    </div>
  );
}
