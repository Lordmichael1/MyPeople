import { useState } from "react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const navigate = useNavigate();

  const getLoginErrorMessage = (code: string): string => {
    switch (code) {
      case "auth/user-not-found":
        return "No user found with this email. Please sign up first.";
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Incorrect password. Please try again.";
      case "auth/invalid-email":
        return "Invalid email format.";
      case "auth/missing-password":
        return "Please enter your password.";
      case "auth/network-request-failed":
        return "Network error. Please check your connection and try again.";
      case "auth/user-disabled":
        return "Your account has been disabled. Please contact support.";
      default:
        return "Login failed. Please try again.";
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setResetMessage("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setSuccess("Login successful! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      const error = err as FirebaseError;
      const message = getLoginErrorMessage(error.code);
      setError(message);
    }
  };

  const handleResetPassword = async () => {
    setError("");
    setSuccess("");
    setResetMessage("");

    if (!email) {
      setError("Please enter your email first to reset your password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage("Password reset email sent. Check your inbox.");
    } catch (err) {
      const error = err as FirebaseError;
      const message = getLoginErrorMessage(error.code);
      setError(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded shadow w-full max-w-sm"
      >
        <h2 className="text-xl font-bold mb-4">Login</h2>

        {/* Error, success, and reset messages */}
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-3">{success}</p>}
        {resetMessage && <p className="text-blue-600 text-sm mb-3">{resetMessage}</p>}

        {/* Email Input */}
        <input
          className="w-full mb-3 p-2 border rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Password Input */}
        <input
          className="w-full mb-3 p-2 border rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Login Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition"
        >
          Login
        </button>

        {/* Forgot Password */}
        <button
          type="button"
          onClick={handleResetPassword}
          className="w-full mt-2 text-blue-600 hover:underline text-sm"
        >
          Forgot Password?
        </button>

        {/* Sign Up Link */}
        <p className="mt-2 text-sm">
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-500 underline">
            Sign up
          </a>
        </p>
      </form>
    </div>
  );
}
