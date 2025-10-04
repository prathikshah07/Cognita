import { motion } from "framer-motion";

export default function SplashScreen() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-indigo-500 to-blue-600">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-white">Cognito</h1>
        <p className="text-lg italic text-white/80">Track. Learn. Balance</p>
      </motion.div>
    </div>
  );
}