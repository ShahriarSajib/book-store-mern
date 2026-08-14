/**
 * pages/auth/Register.jsx
 */
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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data) => {
    try {
      await registerUser(data);
      toast.success("Account created! A verification email has been sent. Please verify your email to log in.");
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Registration failed");
    }
  };

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
