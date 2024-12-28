import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { User } from "lucide-react";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { authUser, updatePassword } = useAuthStore();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!currentPassword ||!newPassword ||!confirmPassword) {
      toast.error("All fields are required");
      return;
    }
    if (currentPassword === newPassword) {
      toast.error("New password cannot be the same as the current password");
      return;
    }
    if (newPassword.length < 3) {
      toast.error("New password must be at least 3 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    await updatePassword(currentPassword, newPassword);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="min-h-screen bg-base-100 pt-16 pb-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-base-300 rounded-xl p-6 space-y-8 shadow-lg">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="mt-2 text-sm text-base-content/70">Your profile information</p>
          </div>
          
          <div className="space-y-1.5">
            <div className="text-sm text-base-content/70 flex items-center gap-2">
              <User className="w-4 h-4" />
              Username
            </div>
            <p className="px-4 py-2.5 bg-base-200 rounded-lg border border-base-300">
              {authUser?.username || authUser?.user?.username || "ini username"}
            </p>
          </div>

          {/* Password Change Form */}
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <h2 className="text-lg font-medium">Change Password</h2>
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input input-bordered w-full"
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input input-bordered w-full"
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input input-bordered w-full"
            />
            <button type="submit" className="btn btn-primary w-full">Change Password</button>
          </form>

          {/* Account Information */}
          <div className="bg-base-200 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-base-300">
                <span>Member Since</span>
                <span>{authUser.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-base-300">
                <span>Account Status</span>
                <span className="text-success">Active</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Role</span>
                <span className="text-info">{authUser?.role}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;