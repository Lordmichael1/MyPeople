import { useState } from "react";
import LoadingSpinner from "../LoadingSpinner";
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
  const [loading, setLoading] = useState(false);
  const [isLoadingSignup, setIsLoadingSignup] = useState(false);

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

  const handleSignupClick = () => {
    setIsLoadingSignup(true);
    setTimeout(() => {
      navigate("/signup");
    }, 500);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setResetMessage("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setSuccess("Login successful! Redirecting...");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err) {
      const error = err as FirebaseError;
      setError(getLoginErrorMessage(error.code));
    } finally {
      setLoading(false);
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

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage("Password reset email sent. Check your inbox.");
    } catch (err) {
      const error = err as FirebaseError;
      setError(getLoginErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  // Fullscreen loader on login or signup navigation
  if (loading || isLoadingSignup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm">
        <form
          onSubmit={handleLogin}
          className="bg-white p-6 rounded shadow w-full"
        >
          <h2 className="text-xl font-bold mb-4">Login</h2>

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          {success && <p className="text-green-500 text-sm mb-3">{success}</p>}
          {resetMessage && (
            <p className="text-blue-600 text-sm mb-3">{resetMessage}</p>
          )}

          <input
            className="w-full mb-3 p-2 border rounded"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="w-full mb-3 p-2 border rounded"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition"
          >
            Login
          </button>

          <button
            type="button"
            onClick={handleResetPassword}
            className="w-full mt-2 text-blue-600 hover:underline text-sm"
          >
            Forgot Password?
          </button>

          <p className="mt-2 text-sm">
            Don’t have an account?{" "}
            <button
              onClick={handleSignupClick}
              className="text-blue-500 underline"
            >
              Sign up
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}