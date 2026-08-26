/**
 * pages/auth/VerifyEmail.jsx
 */
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import authApi from "../../services/authApi";
import AuthShell from "./AuthShell";

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await authApi.verifyEmail(token);
        if (cancelled) return;
        toast.success("Email verified! You can now log in.");
        navigate("/login", { replace: true });
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, navigate]);

  if (status === "loading") {
    return (
      <AuthShell title="Verifying your email…" subtitle="Please wait a moment.">
        <div className="flex justify-center py-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
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
          <Link className="font-medium text-brand-600 hover:underline" to="/register">
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
