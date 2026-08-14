/**
 * pages/auth/ForgotPassword.jsx
 */
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import authApi from "../../services/authApi";
import { forgotPasswordSchema } from "../../utils/validation";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import AuthShell from "./AuthShell";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async ({ email }) => {
    try {
      await authApi.forgotPassword(email);
      toast.success("If an account exists with that email, a reset link has been sent.");
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Something went wrong");
    }
  };

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
