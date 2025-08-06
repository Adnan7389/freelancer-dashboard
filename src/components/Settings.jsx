import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
} from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import toast from "react-hot-toast";

function Settings() {
  const [name, setName] = useState("");
  const [initialName, setInitialName] = useState("");
  const [loading, setLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

  const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        setCurrentUser(user);
      });
      return () => unsubscribe();
    }, []);

  useEffect(() => {
    if (currentUser?.uid) {
      const fetchName = async () => {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setName(docSnap.data()?.name || "");
          setInitialName(docSnap.data()?.name || "");
        }
      };
      fetchName();
    }
  }, [currentUser]);

  const handleUpdateName = async () => {
    if (!currentUser || !currentUser.email) {
    toast.error("Session expired. Please log in again.");
    return;
  }

    if (!name.trim()) return toast.error("Name cannot be empty");
    if (name === initialName) return toast("No changes to save");
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", currentUser.uid), { name });
      setInitialName(name);
      toast.success("Name updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update name");
    }
    setLoading(false);
  };

  const handleChangePassword = async () => {
    
    if (!currentUser || !currentUser.email) {
     toast.error("Session expired. Please log in again.");
     return;
  }

    if (!currentPassword || !newPassword || !confirmPassword) {
      return toast.error("All password fields are required");
    }
    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match");
    }
    if (newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    const credential = EmailAuthProvider.credential(
      currentUser.email,
      currentPassword
    );

    setLoading(true);
    try {
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Password change failed");
    }
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (!currentUser || !currentUser.email) {
    toast.error("Session expired. Please log in again.");
    return;
    }

    if (!deletePassword) {
      return toast.error("Password required to delete account");
    }
    const credential = EmailAuthProvider.credential(
      currentUser.email,
      deletePassword
    );

    setLoading(true);
    try {
      await reauthenticateWithCredential(currentUser, credential);
      await deleteUser(currentUser);
      toast.success("Account deleted");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to delete account");
    }
    setLoading(false);
  };

  const lastLogin = new Date(
    currentUser?.metadata?.lastSignInTime || ""
  ).toLocaleString();

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded-lg mt-10 space-y-10">
      <h2 className="text-2xl font-semibold text-gray-800">Account Settings</h2>

      {/* Profile Info */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email (read-only)
        </label>
        <input
          type="email"
          value={currentUser?.email || ""}
          readOnly
          className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-100"
        />

        <label className="block mt-4 text-sm font-medium text-gray-700 mb-1">
          Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded"
        />
        <button
          onClick={handleUpdateName}
          disabled={loading}
          className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Saving..." : "Save Name"}
        </button>
      </div>

      {/* Change Password */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Change Password
        </h3>
        <input
          type="password"
          placeholder="Current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full mb-2 px-4 py-2 border border-gray-300 rounded"
        />
        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full mb-2 px-4 py-2 border border-gray-300 rounded"
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full mb-2 px-4 py-2 border border-gray-300 rounded"
        />
        <button
          onClick={handleChangePassword}
          disabled={loading}
          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
        >
          {loading ? "Updating..." : "Change Password"}
        </button>
      </div>

      {/* Last Login Info */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-1">
          Last Login
        </h3>
        <p className="text-gray-600">
          {lastLogin} — via {navigator.userAgent}
        </p>
      </div>

      {/* Delete Account */}
      <div>
        <h3 className="text-lg font-semibold text-red-600 mb-2">
          Delete Account
        </h3>
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-sm text-red-600 underline"
          >
            I want to permanently delete my account
          </button>
        ) : (
          <div className="space-y-2">
            <input
              type="password"
              placeholder="Confirm password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="w-full px-4 py-2 border border-red-300 rounded"
            />
            <div className="flex justify-between items-center">
              <button
                onClick={handleDeleteAccount}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                {loading ? "Deleting..." : "Delete Account"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-gray-500 underline text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;
