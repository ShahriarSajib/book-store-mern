/**
 * pages/auth/ForgotPassword.jsx
 */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import authApi from "../../services/authApi";
import { forgotPasswordSchema } from "../../utils/validation";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import AuthShell from "./AuthShell";

export default function ForgotPassword() {
  const [resetLink, setResetLink] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async ({ email }) => {
    try {
      const result = await authApi.forgotPassword(email);
      toast.success(result.message);
      if (result.resetLink) setResetLink(result.resetLink);
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Something went wrong");
    }
  };

  if (resetLink) {
    return (
      <AuthShell
        title="Check your email"
        subtitle="A reset link has been generated."
        footer={
          <>
            Remembered your password?{" "}
            <Link className="font-medium text-indigo-600 hover:underline" to="/login">
              Back to login
            </Link>
          </>
        }
      >
        <div className="space-y-4 text-center">
          <p className="text-sm text-slate-600">
            In development the reset link is shown below. In production it is emailed to you.
          </p>
          <Button
            onClick={() => {
              window.location.href = resetLink;
            }}
          >
            Open reset page
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <>
          Remembered it?{" "}
          <Link className="font-medium text-indigo-600 hover:underline" to="/login">
            Back to login
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register("email")} />
        <Button type="submit" loading={isSubmitting} fullWidth>
          Send reset link
        </Button>
      </form>
    </AuthShell>
  );
}
