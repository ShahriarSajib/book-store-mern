/**
 * App.jsx
 * Responsibility:
 *   - Mount global layout
 *   - Mount route tree
 *   - Mount floating AI chatbot widget (visible on all pages)
 */

import AppRouter from "./routes/AppRouter.jsx";
import Navbar from "./components/layout/Navbar.jsx";
import Footer from "./components/layout/Footer.jsx";
import ChatbotWidget from "./components/chatbot/ChatbotWidget.jsx";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6">
        <AppRouter />
      </main>
      <Footer />
      <ChatbotWidget />
    </div>
  );
}