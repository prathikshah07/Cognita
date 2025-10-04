// src/pages/Onboarding.tsx
import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Onboarding: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signup");

  // Email + Password Auth
  const handleEmailAuth = async () => {
    if (!email || !password) return;
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) setErrorMsg(error.message);
        else {
          setErrorMsg("");
          navigate("/dashboard");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) setErrorMsg(error.message);
        else {
          setErrorMsg("");
          navigate("/dashboard");
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth
  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) {
        setErrorMsg(error.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Google login failed");
    }
  };

  return (
    <div className="flex flex-col h-screen items-center justify-center gap-6 bg-gradient-to-br from-purple-600 to-teal-500 text-white px-4">
      <h1 className="text-4xl font-bold">Cognita</h1>
      <p className="text-lg opacity-50">
        {mode === "signup" ? "Create an account" : "Sign in to continue"}
      </p>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        {/* Email + Password */}
        <div className="flex flex-col gap-2">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-2 rounded-md text-black"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-2 rounded-md text-black"
          />
          <Button
            onClick={handleEmailAuth}
            variant="outline"
            className="text-black border-white"
            disabled={loading}
          >
            {loading ? "Loading..." : mode === "signup" ? "Sign Up" : "Sign In"}
          </Button>
        </div>

        {/* Error Message */}
        {errorMsg && <p className="text-red-300 text-sm">{errorMsg}</p>}

        {/* Google Sign-In */}
        <Button
          onClick={handleGoogleAuth}
          variant="outline"
          className="flex items-center justify-center gap-2 text-black bg-white hover:bg-gray-100"
        >
          <img
            src="https://www.svgrepo.com/show/355037/google.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Continue with Google
        </Button>

        {/* Toggle Mode */}
        <Button
          variant="ghost"
          className="text-white opacity-70 hover:opacity-100"
          onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
        >
          {mode === "signup"
            ? "Already have an account? Sign In"
            : "Don't have an account? Sign Up"}
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
