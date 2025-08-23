import { useState, useEffect } from "react";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "../firebase";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FiLock, FiCheck, FiAlertCircle, FiArrowLeft, FiEye, FiEyeOff } from "react-icons/fi";

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" }); // success/error
  const [isLoading, setIsLoading] = useState(false);
  const [oobCode, setOobCode] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  // Check password requirements
  useEffect(() => {
    setPasswordRequirements({
      minLength: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  }, [password]);

  useEffect(() => {
    const code = searchParams.get("oobCode");
    if (!code) {
      setMessage({ 
        text: "Invalid or expired password reset link.", 
        type: "error" 
      });
      return;
    }

    const verifyCode = async () => {
      try {
        const email = await verifyPasswordResetCode(auth, code);
        setOobCode(code);
        setEmail(email);
      } catch (err) {
        console.error("Error verifying password reset code:", err);
        setMessage({ 
          text: "This password reset link is invalid or has expired. Please request a new one.", 
          type: "error" 
        });
      }
    };

    verifyCode();
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    if (!password || !confirmPassword) {
      setMessage({ 
        text: "Please fill in all fields", 
        type: "error" 
      });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ 
        text: "Passwords do not match", 
        type: "error" 
      });
      return;
    }

    if (!oobCode) {
      setMessage({ 
        text: "Invalid reset code", 
        type: "error" 
      });
      return;
    }

    // Check password strength
    if (!passwordRequirements.minLength || !passwordRequirements.hasNumber || !passwordRequirements.hasSpecialChar) {
      setMessage({ 
        text: "Password does not meet requirements", 
        type: "error" 
      });
      return;
    }

    setIsLoading(true);

    try {
      await confirmPasswordReset(auth, oobCode, password);
      setMessage({ 
        text: "🎉 Password reset successful! Redirecting to login...", 
        type: "success" 
      });
      
      // Clear form
      setPassword("");
      setConfirmPassword("");
      
      // Redirect to login after delay
      setTimeout(() => {
        navigate("/login?reset=success");
      }, 3000);
    } catch (err) {
      console.error("Error resetting password:", err);
      setMessage({ 
        text: err.message || "Failed to reset password. The link may have expired.", 
        type: "error" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (message.type === "error" && !oobCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-xl shadow-md">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <FiAlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="mt-3 text-2xl font-bold text-gray-900">Error</h2>
            <p className="mt-2 text-sm text-gray-600">{message.text}</p>
          </div>
          <div className="mt-6">
            <button
              onClick={() => navigate("/forgot-password")}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Request New Reset Link
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-xl shadow-md">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <FiLock className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-gray-900">Reset Password</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your new password for {email}
          </p>
        </div>

        {message.text && (
          <div className={`rounded-md p-4 ${message.type === 'error' ? 'bg-red-50' : 'bg-green-50'}`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {message.type === 'error' ? (
                  <FiAlertCircle className="h-5 w-5 text-red-400" />
                ) : (
                  <FiCheck className="h-5 w-5 text-green-400" />
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  message.type === 'error' ? 'text-red-800' : 'text-green-800'
                }`}>
                  {message.text}
                </p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pr-10 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pr-10 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="mt-2">
              <p className="text-xs text-gray-500">Password must contain:</p>
              <ul className="text-xs text-gray-600 space-y-1 mt-1">
                <li className={`flex items-center ${passwordRequirements.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                  {passwordRequirements.minLength ? <FiCheck className="mr-1" /> : '•'} At least 8 characters
                </li>
                <li className={`flex items-center ${passwordRequirements.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                  {passwordRequirements.hasNumber ? <FiCheck className="mr-1" /> : '•'} At least one number
                </li>
                <li className={`flex items-center ${passwordRequirements.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
                  {passwordRequirements.hasSpecialChar ? <FiCheck className="mr-1" /> : '•'} At least one special character
                </li>
              </ul>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                isLoading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <button
            onClick={() => navigate("/login")}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center justify-center mx-auto"
          >
            <FiArrowLeft className="mr-1" /> Back to login
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;