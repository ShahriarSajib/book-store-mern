/**
 * pages/customer/Profile.jsx
 * Responsibility: profile details, edit profile, change password, resend verification.
 */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";
import authApi from "../../services/authApi";
import { changePasswordSchema, profileSchema } from "../../utils/validation";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { FaCheckCircle, FaEnvelope, FaExclamationTriangle } from "react-icons/fa";

function Badge({ children, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-700",
    brand: "bg-brand-100 text-brand-700",
  };
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

export default function Profile() {
  const { user, updateUser, getErrorMessage } = useAuth();
  const [resending, setResending] = useState(false);

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name, phone: user.phone || "", bio: user.bio || "" },
  });

  const passwordForm = useForm({ resolver: zodResolver(changePasswordSchema) });

  const onSaveProfile = async (data) => {
    try {
      await updateUser(data);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const onChangePassword = async (data) => {
    try {
      await authApi.changePassword(data);
      passwordForm.reset();
      toast.success("Password updated. Please log in again.");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const onResend = async () => {
    setResending(true);
    try {
      await authApi.resendVerification(user.email);
      toast.success("Verification email sent");
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Could not resend");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My profile</h1>
          <p className="text-sm text-slate-500">Manage your account details and security.</p>
        </div>
        <Badge tone="brand">{user.role}</Badge>
      </div>

      {!user.isEmailVerified && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-3">
            <FaExclamationTriangle className="text-amber-500" />
            <div>
              <p className="text-sm font-medium text-amber-800">Email not verified</p>
              <p className="text-xs text-amber-700">Some features require a verified email address.</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onResend} loading={resending}>
            Resend verification
          </Button>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Profile details</h2>
          <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4" noValidate>
            <Input label="Full name" error={profileForm.formState.errors.name?.message} {...profileForm.register("name")} />
            <Input label="Email" value={user.email} disabled />
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <FaEnvelope className="text-slate-400" />
              <span>{user.isEmailVerified ? "Verified" : "Not verified"}</span>
              {user.isEmailVerified && <FaCheckCircle className="text-green-500" />}
            </div>
            <Input label="Phone" error={profileForm.formState.errors.phone?.message} {...profileForm.register("phone")} />
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Bio</label>
              <textarea
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                {...profileForm.register("bio")}
              />
              {profileForm.formState.errors.bio?.message && (
                <span className="mt-1 block text-xs text-red-600">{profileForm.formState.errors.bio.message}</span>
              )}
            </div>
            <Button type="submit" loading={profileForm.formState.isSubmitting}>
              Save changes
            </Button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Change password</h2>
          <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4" noValidate>
            <Input label="Current password" type="password" error={passwordForm.formState.errors.currentPassword?.message} {...passwordForm.register("currentPassword")} />
            <Input label="New password" type="password" error={passwordForm.formState.errors.password?.message} {...passwordForm.register("password")} />
            <Input label="Confirm new password" type="password" error={passwordForm.formState.errors.confirmPassword?.message} {...passwordForm.register("confirmPassword")} />
            <Button type="submit" loading={passwordForm.formState.isSubmitting} variant="secondary">
              Update password
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}
