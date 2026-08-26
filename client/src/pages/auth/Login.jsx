/**
 * pages/auth/Login.jsx
 */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";
import { loginSchema } from "../../utils/validation";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import AuthShell from "./AuthShell";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get("next");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    try {
      const result = await login(data);
      toast.success(`Welcome back, ${result.user.name}!`);
      const target = next ? decodeURIComponent(next) : result.user.role === "admin" ? "/admin" : "/";
      navigate(target, { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Login failed");
    }
  };

  return (
    <AuthShell
      title="Sign in to your account"
      subtitle="Browse, buy, and get personalized recommendations."
      footer={
        <>
          Don't have an account?{" "}
          <Link className="font-medium text-brand-600 hover:underline" to="/register">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register("email")} />
        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-8 text-xs font-medium text-brand-600 hover:underline"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <div className="flex items-center justify-end">
          <Link className="text-sm text-brand-600 hover:underline" to="/forgot-password">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" loading={isSubmitting} fullWidth>
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}
