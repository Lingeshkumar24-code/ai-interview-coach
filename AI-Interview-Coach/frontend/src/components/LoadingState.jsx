import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function LoadingState({ message = "Thinking..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-ring" />
        <span className="absolute inset-0 rounded-full border-2 border-primary/40" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}
        >
          <Sparkles size={26} className="text-secondary" />
        </motion.div>
      </div>
      <p className="font-display text-sm text-muted">{message}</p>
    </div>
  );
}
