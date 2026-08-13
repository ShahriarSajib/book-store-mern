/**
 * pages/auth/Register.jsx
 */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";
import { registerSchema } from "../../utils/validation";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import AuthShell from "./AuthShell";

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [verificationLink, setVerificationLink] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data) => {
    try {
      const result = await registerUser(data);
      toast.success("Account created! Check your email to verify.");
      if (result.verificationLink) setVerificationLink(result.verificationLink);
      else navigate("/login", { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Registration failed");
    }
  };

  if (verificationLink) {
    return (
      <AuthShell
        title="Almost there — verify your email"
        subtitle="We sent a verification link to your inbox."
        footer={
          <>
            Already verified?{" "}
            <Link className="font-medium text-indigo-600 hover:underline" to="/login">
              Go to login
            </Link>
          </>
        }
      >
        <div className="space-y-4 text-center">
          <p className="text-sm text-slate-600">
            Click the button below to confirm your email address. It expires in 24 hours.
          </p>
          <Button
            onClick={() => {
              window.location.href = verificationLink;
            }}
          >
            Verify my email
          </Button>
          <p className="text-xs text-slate-400">
            This link is shown only in development mode. In production it is sent by email.
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join the AI Bookstore in under a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link className="font-medium text-indigo-600 hover:underline" to="/login">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input label="Full name" placeholder="Jane Doe" error={errors.name?.message} {...register("name")} />
        <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register("email")} />
        <Input label="Password" type="password" placeholder="At least 8 chars, letters + numbers" error={errors.password?.message} {...register("password")} />
        <Input label="Confirm password" type="password" placeholder="Repeat your password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
        <Button type="submit" loading={isSubmitting} fullWidth>
          Create account
        </Button>
        <p className="text-center text-xs text-slate-400">
          By registering you get a <span className="font-medium text-slate-600">customer</span> account. Admins are created via the seed script.
        </p>
      </form>
    </AuthShell>
  );
}
