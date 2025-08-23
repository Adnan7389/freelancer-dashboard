import { useState } from "react";
import { FiMail, FiArrowLeft, FiAlertCircle, FiCheck } from "react-icons/fi";
import { Link } from "react-router-dom";
import { auth } from "../firebase";
import { sendPasswordResetEmail } from "firebase/auth";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" }); // success/error
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    
    if (!email) {
      setMessage({ text: "Please enter your email address", type: "error" });
      return;
    }

    setIsLoading(true);

    try {
      // Option 1: Using Firebase Client SDK (keep this as fallback)
      await sendPasswordResetEmail(auth, email, {
        url: 'https://trackmyincome.vercel.app/reset-password',
        handleCodeInApp: true
      });
      
      setMessage({
        text: "Password reset email sent! Please check your inbox (and spam folder).",
        type: "success"
      });
      setEmail("");
    } catch (error) {
      console.error("Error sending password reset email:", error);
      
      // If Firebase SDK fails, try the REST API as fallback
      if (error.code === "auth/too-many-requests" || error.code === "auth/network-request-failed") {
        try {
          const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;
          const response = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${API_KEY}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                requestType: 'PASSWORD_RESET',
                email: email,
                continueUrl: 'https://trackmyincome.vercel.app/reset-password'
              }),
            }
          );

          const data = await response.json();
          
          if (data.error) {
            throw new Error(data.error.message || 'Failed to send reset email');
          }

          setMessage({
            text: "Password reset email sent via fallback method! Please check your inbox (and spam folder).",
            type: "success"
          });
          setEmail("");
        } catch (restError) {
          console.error("REST API fallback failed:", restError);
          setMessage({
            text: `Failed to send password reset email: ${restError.message}`,
            type: "error"
          });
        }
      } else {
        setMessage({
          text: `Failed to send password reset email: ${error.message}`,
          type: "error"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-xl shadow-md">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
            <FiMail className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-gray-900">Reset Password</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
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
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div className="mt-1">
              <input 
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isLoading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <Link
            to="/login"
            className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center justify-center"
          >
            <FiArrowLeft className="mr-1" /> Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
