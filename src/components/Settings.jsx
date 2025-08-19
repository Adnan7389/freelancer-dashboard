import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
} from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import {
  FiUser,
  FiMail,
  FiLock,
  FiEdit2,
  FiCheck,
  FiX,
  FiShield,
  FiAlertTriangle,
  FiClock,
  FiTrash2,
  FiLoader,
  FiCreditCard
} from "react-icons/fi";

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

  const [subscriptionUrl, setSubscriptionUrl] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [renewsAt, setRenewsAt] = useState(null);
  const [cancelling, setCancelling] = useState(false);

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

          const userData = docSnap.data();
          console.log('User subscription data:', userData); // Debug log
          
          // Handle different status formats (case-insensitive)
          const status = userData?.subscriptionStatus?.toLowerCase() || null;
          setSubscriptionUrl(userData?.subscriptionUrl || null);
          setSubscriptionStatus(status);
          setRenewsAt(userData?.renewsAt || null);
          
          console.log('Subscription status:', status); // Debug log
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
      toast.success("Name updated successfully!");
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
      return toast.error("Passwords don't match.");
    }
    if (newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters.");
    }

    setPasswordLoading(true);
    try {
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);
      toast.success("Password changed successfully!");
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
      toast.success("Account deleted successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to delete account.");
    }
    setDeleteLoading(false);
  };

  const lastLogin = new Date(
    currentUser?.metadata?.lastSignInTime || ""
  ).toLocaleString();

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? You will retain access until the end of your billing period.')) {
      return;
    }

    setCancelling(true);
    try {
      const idToken = await currentUser.getIdToken();
      console.log('Sending request to cancel subscription...');
      
      // In development, this will be http://localhost:3000/api/cancel-subscription
      // In production, it will be /api/cancel-subscription (relative URL)
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        }
      });

      console.log('Response status:', response.status);
      
      // Check if response is OK before trying to parse as JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Try to parse JSON only if response is OK
      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.error('Error parsing JSON:', jsonError);
        throw new Error('Invalid response from server');
      }

      console.log('Subscription cancellation successful:', result);
      
      // Update local state
      setSubscriptionStatus('cancelled');
      toast.success('Your subscription has been cancelled. You will retain access until the end of your billing period.');
    } catch (error) {
      console.error('Error in handleCancelSubscription:', error);
      toast.error(error.message || 'Failed to cancel subscription. Please try again or contact support.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100 mt-10 space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <FiUser className="text-2xl text-blue-500" />
        <h2 className="text-2xl font-bold text-gray-800">Account Settings</h2>
      </div>

      {/* Email Section */}
      <div className="space-y-1">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <FiMail /> Email Address
        </label>
        <input
          type="email"
          value={currentUser?.email || ""}
          readOnly
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Name Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <FiUser /> Display Name
          </label>
          {!editingName && (
            <button
              onClick={() => setEditingName(true)}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
            >
              <FiEdit2 size={14} /> Change
            </button>
          )}
        </div>
        
        {!editingName ? (
          <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-800">{initialName || "Not set"}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your name"
            />
            <div className="flex gap-2">
              <button
                onClick={handleUpdateName}
                disabled={nameSaving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {nameSaving ? (
                  <>
                    <FiLoader className="animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <FiCheck /> Save
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setName(initialName);
                  setEditingName(false);
                }}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg transition-colors"
              >
                <FiX /> Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Password Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <FiLock /> Password
          </label>
          {!changePasswordVisible && (
            <button
              onClick={() => setChangePasswordVisible(true)}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
            >
              <FiEdit2 size={14} /> Change
            </button>
          )}
        </div>

        {changePasswordVisible && (
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm text-gray-600">Current Password</label>
              <input
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600">New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600">Confirm New Password</label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleChangePassword}
                disabled={passwordLoading}
                className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {passwordLoading ? (
                  <>
                    <FiLoader className="animate-spin" /> Updating...
                  </>
                ) : (
                  <>
                    <FiCheck /> Save Password
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setChangePasswordVisible(false);
                }}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg transition-colors"
              >
                <FiX /> Cancel
              </button>
            </div>
          </div>
        )}
      </div>
         
      {/* Manage Subscription Section */}
      {subscriptionUrl && (
        <div className="space-y-3 pt-4 border-t border-gray-200">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <FiCreditCard /> Subscription
          </label>
          <p className="text-sm text-gray-600">
            Status: <strong className={subscriptionStatus === 'cancelled' ? 'text-red-600' : ''}>
              {subscriptionStatus || "Unknown"}
            </strong>
            {renewsAt && subscriptionStatus !== 'cancelled' && (
              <>
                {" "}
                · Next billing:{" "}
                <strong>{new Date(renewsAt).toLocaleDateString()}</strong>
              </>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href={subscriptionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FiCreditCard /> Manage Subscription
            </a>
            
            {(subscriptionStatus && !['cancelled', 'canceled'].includes(subscriptionStatus)) && (
              <button
                onClick={handleCancelSubscription}
                disabled={cancelling}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {cancelling ? (
                  <>
                    <FiLoader className="animate-spin" /> Cancelling...
                  </>
                ) : (
                  <>
                    <FiX /> Cancel Subscription
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Last Login Section */}
      <div className="space-y-1">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <FiClock /> Last Login
        </label>
        <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-800">{lastLogin || "Never logged in"}</p>
        </div>
      </div>

      {/* Delete Account Section */}
      <div className="space-y-3 pt-4 border-t border-gray-200">
        <label className="flex items-center gap-2 text-sm font-medium text-red-600">
          <FiAlertTriangle /> Delete Account
        </label>
        <p className="text-sm text-gray-600">
          This will permanently delete your account and all associated data.
        </p>
        
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800 mt-2"
          >
            <FiTrash2 size={14} /> Delete my account
          </button>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm text-gray-600">Confirm Password</label>
              <input
                type="password"
                placeholder="Enter your password to confirm"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {deleteLoading ? (
                  <>
                    <FiLoader className="animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <FiTrash2 /> Delete Account
                  </>
                )}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg transition-colors"
              >
                <FiX /> Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;