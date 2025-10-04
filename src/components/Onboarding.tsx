// src/pages/Onboarding.tsx
import { Button } from "@/components/ui/button"

export default function Onboarding() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-br from-purple-600 to-teal-500 text-white">
      <h1 className="text-4xl font-bold mb-2">📱 Cognita</h1>
      <p className="text-lg">Track. Learn. Balance.</p>
      <div className="mt-10 w-full max-w-xs space-y-3">
        <Button variant="default" className="w-full text-black">
          Sign in with Google
        </Button>
        <Button variant="outline" className="w-full bg-white text-black">
          Sign in with Email
        </Button>
        <Button variant="secondary" className="w-full text-black">
          Create Account
        </Button>
      </div>
    </div>
  );
}
