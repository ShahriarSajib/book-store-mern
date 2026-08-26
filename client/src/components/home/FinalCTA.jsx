/**
 * components/home/FinalCTA.jsx
 * Strong closing call-to-action, mirrored on the auth shell.
 */
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaShieldAlt,
  FaUserPlus,
  FaKey,
} from "react-icons/fa";
import Button from "../ui/Button";

export default function FinalCTA({ isAuthenticated, isAdmin }) {
  return (
    <section className="section" aria-labelledby="lp-final-title">
      <div className="lp-final">
        <div className="lp-final__inner">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent-700 backdrop-blur">
              Ready when you are
            </p>
            <h2 id="lp-final-title" className="lp-final__title mt-3">
              Find your next favorite book in minutes.
            </h2>
            <p className="lp-final__text">
              Create an account to unlock personalized picks, save your wishlist,
              and pick up where you left off on any device.
            </p>
          </div>
          <div className="lp-final__actions lg:justify-end">
            {!isAuthenticated && (
              <>
                <Link to="/register">
                  <Button
                    size="lg"
                    className="!bg-ink-900 !text-ivory hover:!bg-ink-800 shadow-lg"
                  >
                    <FaUserPlus /> Create free account
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    size="lg"
                    variant="ghost"
                    className="!text-ink-900 hover:!bg-sand border border-ink-200"
                  >
                    <FaKey /> Log in
                  </Button>
                </Link>
              </>
            )}
            {isAuthenticated && (
              <Link to={isAdmin ? "/admin" : "/profile"}>
                <Button
                  size="lg"
                  className="!bg-ink-900 !text-ivory hover:!bg-ink-800 shadow-lg"
                >
                  {isAdmin ? (
                    <>
                      <FaShieldAlt /> Open admin panel
                    </>
                  ) : (
                    <>Go to my profile</>
                  )}{" "}
                  <FaArrowRight />
                </Button>
              </Link>
            )}
            <Link to="/books">
              <Button
                size="lg"
                variant="ghost"
                className="!text-ink-900 hover:!bg-sand border border-ink-200"
              >
                Browse books
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
