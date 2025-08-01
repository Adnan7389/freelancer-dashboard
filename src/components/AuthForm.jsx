import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

function AuthForm({ mode = "login", onSubmit }) {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const schema = z.object({
    email: z.string().email("Please enter a valid email."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: mode === "signup"
      ? z.string().min(6, "Please confirm your password.")
      : z.string().optional(),
  });

  const formSchema =
    mode === "signup"
      ? schema.refine((data) => data.password === data.confirmPassword, {
          message: "Passwords do not match.",
          path: ["confirmPassword"],
        })
      : schema;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  const handleFormSubmit = async (data) => {
    setServerError("");

    try {
      await onSubmit(data.email, data.password);
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {mode === "signup" ? "Sign Up" : "Login"}
        </h2>
        {serverError && <p className="text-red-500 mb-4 text-center">{serverError}</p>}
        <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
          {/* Email */}
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              {...register("email")}
              className="w-full p-2 border rounded"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
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

          {/* Confirm Password (only on signup) */}
          {mode === "signup" && (
            <div className="mb-4">
              <label className="block text-gray-700">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                {...register("confirmPassword")}
                className="w-full p-2 border rounded"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
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
              <Link to="/login" className="text-blue-600 hover:underline">
                Login
              </Link>
            </>
          ) : (
            <>
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="text-blue-600 hover:underline">
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
