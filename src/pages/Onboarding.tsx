// src/pages/Onboarding.tsx
import React from "react";
import { Button } from "@/components/ui/button";

interface OnboardingProps {
  onFinish: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onFinish }) => {
  return (
    <div className="flex flex-col h-screen items-center justify-center gap-6 bg-gradient-to-br from-purple-600 to-teal-500 text-white">
      <h1 className="text-4xl font-bold">Cognita</h1>
      <p className="text-lg opacity-90">Track. Learn. Balance.</p>
      <div className="flex gap-4">
        <Button onClick={onFinish} className="bg-white text-black">
          Sign in with Google
        </Button>
        <Button onClick={onFinish} variant="outline" className="text-white border-white">
          Create Account
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
