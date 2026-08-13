/**
 * pages/auth/ResetPassword.jsx
 */
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import authApi from "../../services/authApi";
import { resetPasswordSchema } from "../../utils/validation";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import AuthShell from "./AuthShell";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  const onSubmit = async (data) => {
    try {
      await authApi.resetPassword(data);
      toast.success("Password reset! You can now log in.");
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Reset failed");
    }
  };

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose a strong password for your account."
      footer={
        <>
          <Link className="font-medium text-indigo-600 hover:underline" to="/login">
            Back to login
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <input type="hidden" {...register("token")} />
        {!token && (
          <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
            No reset token found. Use the link from the reset email.
          </p>
        )}
        <Input label="New password" type="password" placeholder="At least 8 chars, letters + numbers" error={errors.password?.message} {...register("password")} />
        <Input label="Confirm new password" type="password" placeholder="Repeat your password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
        <Button type="submit" loading={isSubmitting} fullWidth>
          Reset password
        </Button>
      </form>
    </AuthShell>
  );
}
