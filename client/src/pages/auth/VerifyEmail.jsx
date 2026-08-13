/**
 * pages/auth/VerifyEmail.jsx
 */
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import authApi from "../../services/authApi";
import Button from "../../components/ui/Button";
import AuthShell from "./AuthShell";

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await authApi.verifyEmail(token);
        if (!cancelled) setStatus("success");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (status === "loading") {
    return (
      <AuthShell title="Verifying your email…" subtitle="Please wait a moment.">
        <div className="flex justify-center py-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      </AuthShell>
    );
  }

  if (status === "success") {
    return (
      <AuthShell
        title="Email verified! 🎉"
        subtitle="Your account is now fully active."
        footer={
          <>
            Ready to shop?{" "}
            <Link className="font-medium text-indigo-600 hover:underline" to="/login">
              Go to login
            </Link>
          </>
        }
      >
        <div className="text-center">
          <p className="mb-6 text-sm text-slate-600">
            Thanks for confirming your email address. You can now sign in and start browsing.
          </p>
          <Button onClick={() => (window.location.href = "/login")}>Sign in</Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Verification failed"
      subtitle="The link is invalid or has expired."
      footer={
        <>
          <Link className="font-medium text-indigo-600 hover:underline" to="/register">
            Create a new account
          </Link>
        </>
      }
    >
      <div className="text-center">
        <p className="text-sm text-slate-600">
          Please try registering again or contact support.
        </p>
      </div>
    </AuthShell>
  );
}
