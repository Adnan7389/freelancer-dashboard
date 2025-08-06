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
  const [currentUser, setCurrentUser] = useState(null);
  const [name, setName] = useState("");
  const [initialName, setInitialName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [nameSaving, setNameSaving] = useState(false);

  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

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
          const nameVal = docSnap.data()?.name || "";
          setName(nameVal);
          setInitialName(nameVal);
        }
      };
      fetchName();
    }
  }, [currentUser]);

  const handleUpdateName = async () => {
    if (!currentUser?.uid || !name.trim()) {
      toast.error("Invalid name or session.");
      return;
    }
    if (name === initialName) {
      toast("No changes to save.");
      setEditingName(false);
      return;
    }
    setNameSaving(true);
    try {
      await updateDoc(doc(db, "users", currentUser.uid), { name });
      setInitialName(name);
      setEditingName(false);
      toast.success("Name updated successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update name.");
    }
    setNameSaving(false);
  };

  const handleChangePassword = async () => {
    if (!currentUser?.email) {
      toast.error("Session expired. Please log in again.");
      return;
    }
    if (!currentPassword || !newPassword || !confirmPassword) {
      return toast.error("All fields are required.");
    }
    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match.");
    }
    if (newPassword.length < 6) {
      return toast.error("Password too short.");
    }

    setPasswordLoading(true);
    try {
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);
      toast.success("Password changed.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setChangePasswordVisible(false);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Password change failed.");
    }
    setPasswordLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (!currentUser?.email) {
      toast.error("Session expired. Please log in again.");
      return;
    }
    if (!deletePassword) {
      return toast.error("Password is required.");
    }

    setDeleteLoading(true);
    try {
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        deletePassword
      );
      await reauthenticateWithCredential(currentUser, credential);
      await deleteUser(currentUser);
      toast.success("Account deleted.");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to delete account.");
    }
    setDeleteLoading(false);
  };

  const lastLogin = new Date(
    currentUser?.metadata?.lastSignInTime || ""
  ).toLocaleString();

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded-lg mt-10 space-y-10">
      <h2 className="text-2xl font-semibold text-gray-800">Account Settings</h2>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={currentUser?.email || ""}
          readOnly
          className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-100"
        />
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        {!editingName ? (
          <div className="flex items-center justify-between">
            <span className="text-gray-800">{initialName || "Not set"}</span>
            <button
              onClick={() => setEditingName(true)}
              className="text-blue-600 text-sm underline"
            >
              Change Name
            </button>
          </div>
        ) : (
          <>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleUpdateName}
                disabled={nameSaving}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {nameSaving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => {
                  setName(initialName);
                  setEditingName(false);
                }}
                className="text-gray-600 underline"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>

      {/* Change Password */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Password</h3>
        {!changePasswordVisible ? (
          <button
            onClick={() => setChangePasswordVisible(true)}
            className="text-sm text-blue-600 underline"
          >
            Change Password
          </button>
        ) : (
          <>
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
            <div className="flex gap-2">
              <button
                onClick={handleChangePassword}
                disabled={passwordLoading}
                className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
              >
                {passwordLoading ? "Updating..." : "Save Password"}
              </button>
              <button
                onClick={() => {
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setChangePasswordVisible(false);
                }}
                className="text-gray-600 underline"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>

      {/* Last Login Info */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-1">Last Login</h3>
        <p className="text-gray-600">{lastLogin} — via {navigator.userAgent}</p>
      </div>

      {/* Delete Account */}
      <div>
        <h3 className="text-lg font-semibold text-red-600 mb-2">Delete Account</h3>
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
                disabled={deleteLoading}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                {deleteLoading ? "Deleting..." : "Delete Account"}
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
