import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

function AuthForm({ mode = "login", onSubmit }) {
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  const handleFormSubmit = async (data) => {
    setError("");

    if (mode === "signup" && data.password !== data.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await onSubmit(data.email, data.password);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {mode === "signup" ? "Sign Up" : "Login"}
        </h2>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Invalid email address",
                },
              })}
              className="w-full p-2 border rounded"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              className="w-full p-2 border rounded"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-sm text-blue-500 mt-1"
            >
              {showPassword ? "Hide" : "Show"} Password
            </button>
          </div>

          {mode === "signup" && (
            <div className="mb-4">
              <label className="block text-gray-700">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                })}
                className="w-full p-2 border rounded"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full text-white p-2 rounded ${
              isSubmitting ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSubmitting
              ? "Processing..."
              : mode === "signup"
              ? "Sign Up"
              : "Login"}
          </button>
        </form>

        <p className="mt-4 text-center">
          {mode === "signup" ? (
            <>
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600">
                Login
              </Link>
            </>
          ) : (
            <>
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="text-blue-600">
                Sign Up
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default AuthForm;
