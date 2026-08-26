/**
 * components/layout/Navbar.jsx
 * Sticky glass navbar with desktop links, mobile drawer, cart badge, user menu.
 */
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaBook,
  FaBrain,
  FaFire,
  FaMoon,
  FaShieldAlt,
  FaShoppingCart,
  FaSignOutAlt,
  FaSun,
  FaTimes,
  FaUser,
} from "react-icons/fa";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";
import { useCartContext } from "../../context/CartContext";
import { useTheme } from "../../context/ThemeContext";
import Button from "../ui/Button";

const navLink = ({ isActive }) =>
  `navbar__link${isActive ? " is-active" : ""}`;

const drawerLink = ({ isActive }) =>
  `navbar__drawer-link${isActive ? " is-active" : ""}`;

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { count: cartCount, ensureLoaded } = useCartContext();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) ensureLoaded();
  }, [isAuthenticated, ensureLoaded]);

  // Close user menu on outside click
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    setDrawerOpen(false);
    await logout();
    toast.success("Logged out");
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand" onClick={() => setDrawerOpen(false)}>
          <span className="navbar__brand-mark">
            <FaBook />
          </span>
          <span>BookVerse</span>
        </Link>

        <nav className="navbar__menu" aria-label="Primary">
          <NavLink to="/" className={navLink} end>
            Home
          </NavLink>
          <NavLink to="/books" className={navLink}>
            Books
          </NavLink>
          <NavLink to="/trending" className={navLink}>
            <FaFire className="text-orange-500" /> Trending
          </NavLink>
          <NavLink to="/ai-search" className={navLink}>
            <FaBrain className="text-brand-500" />
            <span>AI Search</span>
            <span className="navbar__pill">NEW</span>
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" className={navLink}>
              <FaShieldAlt /> Admin
            </NavLink>
          )}
        </nav>

        <div className="navbar__actions">
          <button
            type="button"
            onClick={toggleTheme}
            className="navbar__link"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <FaSun /> : <FaMoon />}
          </button>

          {isAuthenticated && !isAdmin && (
            <Link
              to="/cart"
              className="navbar__link relative"
              aria-label="View cart"
            >
              <FaShoppingCart />
              <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            </Link>
          )}

          {isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="avatar-btn"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <span className="avatar">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
                <span className="hidden text-sm font-medium text-ink-700 sm:inline">
                  {user.name?.split(" ")[0]}
                </span>
              </button>

              {menuOpen && (
                <div className="user-menu" role="menu">
                  <div className="user-menu__head">
                    <p className="truncate text-sm font-semibold text-ink-900">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-ink-500">{user.email}</p>
                    <span className="user-menu__role">{user.role}</span>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="user-menu__item"
                    role="menuitem"
                  >
                    <FaUser /> <span className="text-ink-400" />&nbsp;My profile
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="user-menu__item"
                      role="menuitem"
                    >
                      <FaShieldAlt className="text-ink-400" /> Admin panel
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="user-menu__item user-menu__item--danger"
                    role="menuitem"
                  >
                    <FaSignOutAlt /> Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link to="/register" className="hidden sm:inline-flex">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}

          <button
            type="button"
            className="navbar__burger"
            onClick={() => setDrawerOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={drawerOpen}
          >
            {drawerOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {drawerOpen && (
        <div className="navbar__drawer">
          <NavLink to="/" className={drawerLink} end onClick={() => setDrawerOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/books" className={drawerLink} onClick={() => setDrawerOpen(false)}>
            Books
          </NavLink>
          <NavLink to="/trending" className={drawerLink} onClick={() => setDrawerOpen(false)}>
            Trending
          </NavLink>
          <NavLink to="/ai-search" className={drawerLink} onClick={() => setDrawerOpen(false)}>
            AI Search
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" className={drawerLink} onClick={() => setDrawerOpen(false)}>
              Admin
            </NavLink>
          )}
          <div className="navbar__drawer-sep" />
          {!isAuthenticated && (
            <>
              <Link to="/login" className="navbar__drawer-link" onClick={() => setDrawerOpen(false)}>
                Log in
              </Link>
              <Link to="/register" className="navbar__drawer-link navbar__drawer-link--cta" onClick={() => setDrawerOpen(false)}>
                Sign up
              </Link>
            </>
          )}
          {isAuthenticated && (
            <button
              type="button"
              onClick={handleLogout}
              className="navbar__drawer-link text-red-600"
            >
              Log out
            </button>
          )}
        </div>
      )}
    </header>
  );
}
